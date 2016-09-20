const HISTORY_SIZE = 5;

module.exports = function(build, config) {
  const name = build.pipeline;

  const goConfig = config.gocd;

  const url = `${pipelineUrl(goConfig, name, true)}/history`;

  return {
    type: 'gocd',
    name,
    opts: {
      url,
      auth: {
        user: goConfig.user,
        password: goConfig.password
      }
    },
    transform: (res) => {
      const pipeline = res.pipelines[0];
      const stage = pipeline.stages[0];
      const label = pipeline.counter;
      return {
        label,
        reason: extractReason(res),
        status: pipeline.stages.reduce(reduceStatus, ''),
        url: `${pipelineUrl(goConfig, name)}/${label}/${stage.name}/${stage.counter}`,
        confidence: calculateConfidence(res.pipelines)
      };
    }
  };
};

function calculateConfidence(pipelines) {
  const sample = pipelines.slice(0, HISTORY_SIZE);
  const passing = sample.filter((pipeline) => pipeline.stages.reduce(reduceStatus, '') === 'success');
  return passing.length / sample.length;
}

function pipelineUrl(goConfig, name, api = false) {
  return `${goConfig.url}/go${api ? '/api' : ''}/pipelines/${name}`;
}

function extractReason(res) {
  const buildCause = res.pipelines[0].build_cause;
  if (buildCause.trigger_forced) {
    return 'retry';
  } else {
    return buildCause.material_revisions[0].modifications[0].comment;
  }
}

function reduceStatus(status, stage) {
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
}
