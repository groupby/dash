# dash
A dashboard for visualizing builds across multiple services.

Expects a file `config.yml` at the root directory in order to request
and display build statuses.

Currently supported:
- circleci (github builds only)
- gocd

![screenshot](https://cloud.githubusercontent.com/assets/3784470/18475949/5082b700-7996-11e6-8f86-b35b332e1c99.png)

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

## Local

To test locally run the following and navigate to http://localhost:8080

`npm start`

## Docker

To build the container:

`docker build -t groupby/dash .`

To deploy:

`docker run -d -p 3000:8080 --name my-dashboard groupby/dash`

### Attributions

Icons made by [Zlatko Najdenovski](http://www.flaticon.com/authors/zlatko-najdenovski) from www.flaticon.com
