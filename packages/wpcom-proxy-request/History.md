# History

## 6.0.0 / TBD

- Breaking: Return Promise (rather than `XMLHttpRequest` instance) if no callback argument is provided.
  - In practice, most people have probably been using the callback rather than the returned `XMLHttpRequest` instance, so this shouldn't be a breaking change for most.
- Add `requestAllBlogsAccess()`.
- Add a few type definitions.
- Move the published `build/` folder to `dist/` to align with other Calypso packages
- Upgrade dependency 'debug' to 4.1.1
- Remove `component-event` dependency, use `addEventListener`/`removeEventListener` directly
- Replace unmaintained `uid` dependency by well-maintained `uuid`

## 5.0.2 / 2018-10-30

- Fix the Chrome site isolation workaround to not break file uploads on Safari 10

## 5.0.1 / 2018-10-29

- Work around a Chrome site isolation bug when uploading files

## 3.0.0 / 2016-07-27

- examples: add wp-api example
- client-test-app: add index.html
- Add test stuff - Add tests - Add rules to compile the browser application
- core: improve WP-API integration - detect response error in envelope mode - remove \_headers from body and add a thrid response parameter in the callback - add status to headers parameter
- examples: eslint
- examples: update bundle path and global var
- create bundle file only for testing purpose
- pkg: make build in prepublish hook
- pkg: publish only useful files in npm package
- rewrite using ES6
- Add eslint rules
- change compiling process - Use n8-make to make pre-compilation - Make bundle file using Webpack``
- index: opt-in to `supports_error_obj` better Errors
- Use `wp-error` module for common Error handling logic
- index: add missing `uninstall()` function
- Fix TypeError on string body 'error' from rest-proxy
- Add pinghub example
- Add support for persistent connections

## 2.0.0 / 2016-03-11

- index: opt-in to `supports_error_obj` better Errors

## 1.2.0 / 2016-03-09

- dist: recompile
- Use `wp-error` module for common Error handling logic
- add missing LICENSE stuff
- index: add missing `uninstall()` function

## 1.1.1 / 2016-03-08

- fix TypeError on string body 'error' from rest-proxy

## 1.1.0 / 2016-02-24

- support persistent connections e.g. websockets
- add example for connecting to Pinghub via websocket

## 1.0.5 / 2015-11-22

- package: update "debug" to v2.2.0

## 1.0.4 / 2015-02-27

- dist: recompile
- wrapping try/catch on an IIFE.
- optimization for short-circuit evaluation.
- detecting support for the structured clone algorithm.
- forcing JSON string for postMessage/onmessage to circumvent IE9 limitations.

## 1.0.3 / 2015-02-09

- index: don't throw in the case that there's no `buffered` Array
- examples: better me.html example output

## 1.0.2 / 2014-10-21

- Republish since npm messed up v1.0.1

## 1.0.1 / 2014-10-21

- index: bail if no matching XHR instance was found
- index: use `event` module to listen for XHR events

## 1.0.0 / 2014-10-20

- index: refactor to not use Promise anymore
- examples: tweak "me.html" example since it no longer returns a Promise
- examples: add "progress" listeners to upload example
- examples: multiply percent complete by 100
- examples: make "upload.html" example use user's primary blog
- package: update "debug" to v2.1.0
- package: update "browserify" to v6.1.0
- package: remove unused "promise" dependency

## 0.2.5 / 2014-06-26

- dist: recompile
- index: honor ports on the host page (#3, @rralian)

## 0.2.4 / 2014-06-24

- dist: recompile
- package: update all dependencies

## 0.2.3 / 2014-06-24

- dist: recompile
- index: don't bother doing a debug() call for the metaAPI calls
- index: use %o debug formatter when it makes sense
- index: implement File -> ArrayBuffer manual conversion for Firefox

## 0.2.2 / 2014-06-10

- dist: recompile
- examples: add `freshly-pressed.html` example
- package: be loose with the `debug` version

## 0.2.1 / 2014-06-05

- package: update "debug" to v1.0.0

## 0.2.0 / 2014-05-27

- index: update <iframe> "src" URL
- examples: fix <script> tag src location

## 0.1.1 / 2014-05-12

- examples: add `upload.html` example
- index: rename `res` variable to `body`
- index: bind to iframe "load" event before setting `.src`

## 0.1.0 / 2014-04-22

- initial release
