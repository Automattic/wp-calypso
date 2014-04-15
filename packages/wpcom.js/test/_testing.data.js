
/**
 * Module dependencies
 */

var WPCOM = require('../');
var Sites = require('../lib/sites');
var util = require('./util');

/**
 * Package
 */

var pkg = require('../package.json');

/**
 * Testing data
 */

var data = require('./data');

/**
 * Sync tests
 */

describe('testing data', function(){
  describe('package', function(){
    it('version should have x.x.x format', function(){
      pkg.version.should.match(/\d\.\d\.\d/);
    });
  });

  describe('data', function(){
    it('global `token` should be a String', function(){
      data.token.global
        .should.be.an.instanceOf(String);
    });

    it('`public_site` should be defined', function(){
      data.site.public.url
        .should.be.ok
        .and.an.instanceOf(String);
    });

    it('`private_site` should be defined', function(){
      data.site.private.url
        .should.be.ok
        .and.an.instanceOf(String);
    });

    it('`new_post_data` should be ok', function(){
      data.new_post_data
        .should.be.ok
        .and.an.instanceOf(Object);

      data.new_post_data.title
        .should.be.an.instanceOf(String);

      data.new_post_data.content
        .should.be.an.instanceOf(String);
    });
  });

  describe('util', function(){
    it('should create a wpcom instance', function(){
      var wpcom = util.wpcom();
      wpcom.should.be.an.instanceOf(WPCOM);
    });

    it('should create a blog instance', function(){
      var site = util.public_site();

      site
        .should.be.an.instanceOf(Sites);

      site._id
        .should.be.eql(data.site.public.url);
    });
  });
});
