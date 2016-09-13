const Koa = require('koa');
const Router = require('koa-router');
const IO = require('koa-socket');
const serve = require('koa-static');
const jobFactory = require('./src/index');

const jobs = [];
const app = new Koa();
const io = new IO();
const router = new Router({ prefix: '/api' });

app.use(serve(`./static/`));

router.get('/jobs', (ctx) => ctx.body = jobs.map((job) => job.name));
router.post('/refresh', (ctx) => {
  ctx.status = 200;
  jobs.forEach((job) => job.job());
});

app.use(router.routes());
io.attach(app);
app.listen(process.env.PORT || 8080);

jobFactory.generate({ io, jobs });
