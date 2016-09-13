# dash
A dashboard for visualizing builds across multiple services.

Expects a file `config.yml` at the root directory in order to request
and display build statuses.

Currently supported:
- circleci (github builds only)
- gocd

## Configuration

```yaml
builds:
  - type: circleci
    name: myaccount/my-repo
    branch: master
  - type: circleci
    name: myaccount/other-repo
  - type: gocd
    pipeline: MyPipeline

circleci-token: XXX

gocd:
  url: https://gocd.mydomain.com
  user: user
  password: password1
```

### Attributions

Icons made by [Zlatko Najdenovski](http://www.flaticon.com/authors/zlatko-najdenovski) from www.flaticon.com
