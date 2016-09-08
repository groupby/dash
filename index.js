const Koa = require('koa');
const Router = require('koa-router');
const IO = require('koa-socket');
const serve = require('koa-static');
const yaml = require('js-yaml');
const fs = require('fs');
const rp = require('request-promise');
const {
  CronJob
} = require('cron');

const jobs = [];
const app = new Koa();
const io = new IO();
const router = new Router({
  prefix: '/api'
});

app.use(serve(`./static/`));

router.get('/jobs', (ctx) => ctx.body = jobs.map((job) => job.name));
router.post('/refresh', (ctx) => {
  ctx.status = 200;
  jobs.forEach((job) => job.job());
});

app.use(router.routes());
io.attach(app);
app.listen(process.env.PORT || 8080);

let config;
try {
  config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
} catch (e) {
  console.error(e);
}

const circleToken = config['circleci-token'];

if ('builds' in config) {
  for (let build of config.builds) {
    let opts;
    let buildName;
    let transform;
    switch (build.type) {
      case 'circleci':
        buildName = build.name;
        let url = `https://circleci.com/api/v1.1/project/github/${buildName}`;
        if (build.branch) url += `/tree/${build.branch}`;
        opts = {
          url,
          qs: { 'circle-token': circleToken },
          json: true
        };
        transform = (res) => ({
          label: res[0].build_num,
          reason: `${res[0].why}: ${res[0].subject ? res[0].subject : 'release ' + res[0].vcs_tag}`,
          status: res[0].status
        });
        break;
      case 'gocd':
        buildName = build.pipeline;
        opts = {
          url: `${config.gocd.url}/go/api/pipelines/${buildName}/history`,
          auth: {
            user: config.gocd.user,
            password: config.gocd.password
          },
          json: true
        };
        transform = (res) => ({
          label: res.pipelines[0].label,
          reason: (() => {
            const buildCause = res.pipelines[0].build_cause;
            if (buildCause.trigger_forced) {
              return 'retry';
            } else {
              return buildCause.material_revisions[0].modifications[0].comment;
            }
          })(),
          status: res.pipelines[0].stages.reduce((status, stage) => {
            switch (stage.result) {
              case 'Passed':
                return 'success';
              case 'Failed':
                return 'failed';
              case 'Unknown':
                return 'running';
              default:
                return status;
            }
          }, '')
        });
        break;
    }
    if (transform) {
      const job = () => rp(opts)
        .then((res) => {
          io.broadcast(buildName, transform(res));
        })
        .catch((err) => console.error(err));
      job();
      jobs.push({
        name: buildName,
        job
      });
      new CronJob('*/1 * * * *', job, null, true);
    }
  }
}
