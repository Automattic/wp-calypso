
/**
 * Module dependencies
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var util = require('./util');
var assert = require('assert');

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
      assert.ok((pkg.version).match(/\d\.\d\.\d/));
    });
  });

  describe('data', function(){
    it('global `token` should be a String', function(){
      assert.equal('string', typeof data.global);
    });

    it('`public_site` should be defined', function(){
      assert.equal('string', typeof data.site.public.url);
    });

    it('`private_site` should be defined', function(){
      assert.equal('string', typeof data.site.private.url);
      assert.equal('number', typeof data.site.private.id);
      assert.equal('string', typeof data.site.private.token);
    });

    it('`new_post_data` should be ok', function(){
      assert.ok(data.new_post_data);
      assert.equal('object', typeof data.new_post_data);

      assert.equal('string', typeof data.new_post_data.title);
      assert.equal('string', typeof data.new_post_data.content);
    });
  });

  describe('util', function(){
    it('should create a wpcom instance', function(){
      var wpcom = util.wpcom();
      assert.ok(wpcom instanceof WPCOM);
    });

    it('should create a blog instance', function(){
      var site = util.public_site();

      assert.ok(site instanceof Site);
      assert.equal(data.site.public.url, site._id);
    });
  });
});
