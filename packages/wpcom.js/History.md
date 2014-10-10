
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
