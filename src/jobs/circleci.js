const BASE_URL = 'https://circleci.com/api/v1.1/project/github';
const HISTORY_SIZE = 5;

module.exports = function(build, config) {
  const name = build.name;

  const circleToken = config['circleci-token'];

  let url = `${BASE_URL}/${name}`;
  if (build.branch) url += `/tree/${build.branch}`;

  return {
    type: 'circleci',
    name,
    opts: {
      url,
      qs: { 'circle-token': circleToken }
    },
    transform: (res) => {
      const subject = res[0].subject ? res[0].subject : `release ${res[0].vcs_tag}`;

      return {
        label: res[0].build_num,
        reason: `${res[0].why}: ${subject}`,
        status: extractStatus(res[0]),
        url: res[0].build_url,
        confidence: calculateConfidence(res)
      };
    }
  };
};

function extractStatus(build) {
  return build.status === 'fixed' ? 'success' : build.status;
}

function calculateConfidence(res) {
  const sample = res.slice(0, HISTORY_SIZE);
  const passing = sample.filter((build) => build.status === 'success');
  return passing.length / sample.length;
}
