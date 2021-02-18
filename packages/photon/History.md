# History

## 3.0.0 / TBD

- Drop dependency on `url` npm package.
- Breaking change: support for URL / URLSearchParams APIs is now required.

## 2.1.0 / 2019-06-03

- Move source into [Calypso](https://github.com/Automattic/wp-calypso).
- Remove browser build from module.
- Include esm and commonjs in module.
- Update debug to v4

## 2.0.1 / 2017-11-08

- Update to support Node.js version 7+ due to changes in `url.format` (#6, @DanReyLop)
- Update dependencies

## 2.0.0 / 2016-02-02

- Add support for the `ssl` parameter to fetch images from https URLs
- Readme: add Travis-CI badge
- add `.travis.yml` file for Travis-CI
- package: update "mocha" to v2.4.5
- Return `null` for external URLs that contain querystrings (Breaking change!)

## 1.0.4 / 2015-01-26

- package: allow any "debug" v2
- package: update "browserify" to v8.1.1
- Fix how querystrings are dealt with for photon hosts, protcolless URLs (#3, @blowery)

## 1.0.3 / 2014-12-20

- fixes photonception issue (#2)
- package: update "browserify" to v6.1.0
- dist: recompile

## 1.0.2 / 2014-06-13

- Readme: add "Terms of Service" section
- index: remove "port 80" debug note

## 1.0.1 / 2014-06-11

- package: be loose with the `debug` version
- package: update "debug" to v1.0.0
- Readme: use Cloudup image in examples

## 1.0.0 / 2014-06-02

- Major version bump for npm

## 0.0.1 / 2014-06-02

- Readme: add npm install instructions
- idnex: statically hash the subdomain based on the URL
- add Makefile, with browserify make target for browsers
- add Readme.md file
- add LICENSE file
- index: prevent Photon URL "inception"
- test: initial tests
- initial commit
