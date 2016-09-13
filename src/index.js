const { CronJob } = require('cron');
const fs = require('fs');
const rp = require('request-promise');
const yaml = require('js-yaml');
const circleJob = require('./jobs/circleci');
const goJob = require('./jobs/gocd');

module.exports = {
  generate(app) {
    const config = readConfig();

    if ('builds' in config) {
      for (let build of config.builds) {
        const jobConfig = configureJob(build, config);
        if (jobConfig) {
          createJob(app, jobConfig);
        }
      }
    }
  }
};

function readConfig() {
  try {
    return yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'));
  } catch (e) {
    console.error(e);
    return {};
  }
}

function configureJob(build, config) {
  switch (build.type) {
    case 'circleci':
      return circleJob(build, config);
    case 'gocd':
      return goJob(build, config);
    default:
      return null;
  }
}

function createJob({ io, jobs }, jobConfig) {
  const { name, opts, transform } = jobConfig;
  const job = () => rp(Object.assign(opts, { json: true }))
    .then((res) => {
      io.broadcast(name, transform(res));
    })
    .catch((err) => console.error(err));
  jobs.push({
    name,
    job
  });
  new CronJob('*/1 * * * *', job, null, true);
}
