const BASE_URL = 'https://circleci.com/api/v1.1/project/github';

module.exports = function(build, config) {
  const name = build.name;

  const circleToken = config['circleci-token'];

  let url = `${BASE_URL}/${name}`;
  if (build.branch) url += `/tree/${build.branch}`;

  return {
    name,
    opts: {
      url,
      qs: { 'circle-token': circleToken }
    },
    transform: (res) => {
      console.log('circleci', res.length);
      return {
        label: res[0].build_num,
        reason: `${res[0].why}: ${res[0].subject ? res[0].subject : 'release ' + res[0].vcs_tag}`,
        status: res[0].status,
        url: res[0].build_url,
        confidence: calculateConfidence(res)
      };
    }
  };
};

function calculateConfidence(res) {
  const passing = res.filter((build) => build.status === 'success');
  return passing.length / res.length;
}
