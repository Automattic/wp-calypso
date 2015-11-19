
4.8.0 / 2015-11-19
==================

 * Use webpack to build final product

4.7.0 / 2015-09-07
==================

 * Return the static Promise.{reject/resolve} objects
 * Set default Promise return in absence of callback

4.6.2 / 2015-09-03
==================

 * Add Promise documentation
 * circle: add config file. set node version
 * Add Promsie Wrapper

4.6.1 / 2015-08-30
==================

 * Add site.pageTemplates() test
 * Add site.pageTemplates() method

4.6.0 / 2015-08-13
==================

 * batch: remove bracket in url query
 * send-request: parse and assign query param rightly
 * example: add cors batch example

4.5.3 / 2015-08-11
==================

 * send-request: always stringify query object

4.5.2 / 2015-08-11
==================

 * Use PHP style query params for a batch request

4.5.1 / 2015-07-08
==================

 * pkg: bump "wpcom-xhr-request" to "0.3.2"
 * send-request: handler proxyOrigin parameter

4.5.0 / 2015-05-06
==================

 * docs: fix references to `wpcom.sites()` -> `wpcom.site()`
 * site: fix query args for `statsVideo` and `statsPostViews`

4.4.1 / 2015-04-30
==================

 * core: store token if is defined

4.4.0 / 2015-04-20
==================

 * test: fix a couple of failing tests and methods
 * docs: prepare for auto-generated docs and code samples

4.3.0 / 2015-04-15
==================

 * site: add stats endpoints
 * docs: update OAuth and testing docs

4.2.1 / 2015-03-31
==================

 * pkg: bump `wpcom-xhr-request` to `0.3.1`

4.2.0 / 2015-03-13
==================

 * send-request: check `query` paramter
 * test: add util req testing file
 * test: update wpcom.site.tagsList test
 * test: update wpcom.site.categoriesList test

4.1.0 / 2015-02-18
==================

 * test: force apiVersion to 1 for some stats tests
 * site: fix embed_url param
 * send-request: default value for `query` is {}

4.0.0 / 2015-02-09
==================

 * request: update path for send-request module
 * core: add sendRequest() to suppoert compatibility
 * test: add users suggest testing file
 * update to wpcom.req method
 * test: add site.follow testing file
 * test: add site embeds testing file
 * test: add site.shortcodes testing file
 * send-response: set apiVersion from wpcom property
 * core: add apiVersion as property. Define `1.1` as default
 * request: refact -> create Req class

3.2.0 / 2015-02-05
==================

 * site: use `list` builder for `embdesList` method
 * test: site: add embedsList() test
 * site: use `list` builder for shortcodesList method
 * test: add site.shortcodesList test
 * post: propagate `id` and `slug` when post is added
 * improve tests
 
3.1.1 / 2014-12-08
==================

 * site: URIencode id. This allows to use the API wit Jetpack sites installed on subfolders.

3.1.0 / 2014-12-04
==================

 * core: request handler parameter in constructor

3.0.0 / 2014-12-02
==================

 * add `requite` util module
 * update coding
 * core: Added users suggest endpoint
 * Merge pull request #71 from Automattic/add/post-restore-endpoint
 * Allow optional third-index apiVersion for resource list
 * test: improve media util functions
 * test: pre-process files in addFiles test
 * test: update apiVersion tests using getFiles()
 * test: add test.getFiles() method
 * examples: better proxy me.html output
 * test: fix testing data
 * Get rid of confusion between `index.js` and `wpcom+xhr.js`

2.6.0 / 2014-11-12
==================

 * media: fix bug in checking File on server-side

2.5.0 / 2014-11-12
==================

 * media: fix checking File parameter in #addFiles method

2.4.0 / 2014-11-03
==================

 * media: fix bug adding media files in client-side
 * examples: add browser-proxy "upload.html" example
 * media: add optional [query] parameter.
 * pkg: update "wpcom-xhr-request" to v0.3.0
 * add `return` statement to all `sendRequest()` calls
 * media: support new api features
 * media: use api version 1.1

2.3.0 / 2014-10-10
==================

 * test: add batch test
 * Add batch support

2.2.0 / 2014-10-03
==================

 * test: add tag tests
 * site: add site#tag() method
 * tag: add tag library
 * test: fix typeof asserts
 * test: add category tests
 * site: add site#category() method
 * category: add category
 * test: move up `global` testing value
 * package: update "debug" to v2.0.0
 * Add media.update method

2.1.0 / 2014-09-11
==================

 * Add tests for comment likes
 * add CommentLike module and functions to Comment (mirroring Like for Posts)
 * landing v1

2.0.4 / 2014-08-05
==================

 * dist: recompile
 * docs: update Follow doc page
 * Add `Follow` implementation
 * update "browserify" to v4.2.1

2.0.3 / 2014-07-15
==================

 * dist: recompile
 * package: update "browserify" to v4.2.0
 * package: update "wpcom-xhr-request" to v0.2.5
 * site: use `%o` formatter for debug() calls

2.0.2 / 2014-06-25
==================

  * dist: recompile
  * examples: add "browser-proxy" example
  * Makefile: remove `-xhr`
  * index: inline the `sendRequest()` function
  * package: update "browserify" to v4.1.11
  * package: update "wpcom-xhr-request" to v0.2.3
  * wpcom+xhr: add JSDoc comment

2.0.1 / 2014-06-10
==================

  * dist: recompile
  * package: update "wpcom-xhr-request" to v0.2.2
  * docs: fix typo in function name
  * docs: fix typo in `post` docs
  * docs: fix relative links in `WPCOM` main docs
  * package: be loose with the `debug` version
  * package: add "license" field

2.0.0 / 2014-06-05
==================

  * dist: rebuild
  * package: update "debug" and "wpcom-xhr-request" dependencies
  * package: add "keywords" field
  * test: fix testing data
  * package: update "description"
  * add LICENSE file
  * package, Redme: use lowercase .JS, add "web"
  * example: add uploading image browser example
  * delete legacy wpcom-proxy (#39, @guille)
  * examples: a few tweaks
  * example: remove token value

1.2.3 / 2014-05-20
==================

 * xhr: add wpcom.setToken()

1.2.2 / 2014-05-19
==================

 * New methods:
    - post.comment()
    - post.comments()

    - comment.get()
    - comment.update()
    - comment.replies()
    - comment.reply()
    - comment.delete()

 * dist: recompile
 * add test for all new methods
 * update documentation

1.2.1 / 2014-05-13
==================

 * New methods:
    - site.addMediaFiles()
    - site.addMediaUrls()
    - site.deleteMedia()
    - site.usersList()
    - site.likesList()

    - media.addFiles()
    - media.addUrls()
    - media.del()

    - post.reblog()
    - post.related()

    - like.state()
    - like.mine()
    - like.del()

    - reblog.to()
    - reblog.state()

 * Add and update examples over the browser
 * Improve and update documentation

1.2.0 / 2014-04-23
==================

  * Remove internal "endpoints" `.json` files, saves ~8kb uncompressed (#19)
  * package: update "description" field
  * History: match `git changelog` output
  * rename `doc` -> `docs` and `example` to `examples`

1.1.0 / 2014-04-22
==================

  * site: rename Sites to Site
  * dist: add the compiled `wpcom-proxy.js` and `wpcom.js` files
  * Readme: improve

1.0.0 / 2014-04-22
==================

  * remove `req.js`, move send() fn to WPCOM class
  * add wpcom+proxy.js and wpcom+xhr.js wrapper class scripts
  * add browserify standalone build rules

0.3.0 / 2014-04-11
==================

  * rename npm name to `wpcom`

0.2.3 / 2014-04-10
==================

  * add me.sites() method

0.2.2 / 2014-04-02
==================

  * New methods:
    - me.connections()
    - me.groups()
    - me.likes()
    - post.edit()
    - post.del()
  * improve error handling
  * improve endpoint files structure
  * update documentation

0.2.1 / 2014-03-31
==================

  * replace `request` by `superagent`

0.2.0 / 2014-03-28
==================

  * pck: bump wp-connect@0.2.0
  * set token in the constructor
  * remove .token() method

0.1.1 / 2014-03-27
==================

  * core: cretae a Req instance in this.req property
  * req: refact -> expose a Req constructor
  * example: add simple exmaple application

0.1.0 / 2014-03-19
==================

  * change the API
  * doc: update documentation
  * add tests

0.0.2 / 2014-02-20
==================

  * first approach
