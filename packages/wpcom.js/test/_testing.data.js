
/**
 * Module dependencies
 */

var WPCOM = require('../');
var util = require('./util');

/**
 * Package
 */

var pkg = require('../package.json');

/**
 * Testing data
 */

var tdata = require('./data');

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
    it('`client id` should be a string of numbers', function(){
      (Number(tdata.client_id)).should.be.a.Number;
    });

    it('`client secret` length and type', function(){
      tdata.client_secret
        .should.be.an.instanceOf(String)
        .and.length(64);
    });

    it('`token` should be a String', function(){
      tdata.token
        .should.be.an.instanceOf(String);
    });

    it('`public_site` should be defined', function(){
      tdata.public_site
        .should.be.ok
        .and.an.instanceOf(String);
    });

    it('`private_site` should be defined', function(){
      tdata.private_site
        .should.be.ok
        .and.an.instanceOf(String);
    });

    it('`new_post_data` should be ok', function(){
      tdata.new_post_data
        .should.be.ok
        .and.an.instanceOf(Object);

      tdata.new_post_data.title
        .should.be.an.instanceOf(String);

      tdata.new_post_data.content
        .should.be.an.instanceOf(String);
    });
  });

  describe('util', function(){
    it('should create a wpcom instance', function(){
      var wpcom = util.wpcom();
      wpcom.should.be.an.instanceOf(WPCOM);
    });

    it('should create a wpcom instance setting site `id`', function(){
      var wpcom = util.public_site();
      wpcom
        .should.be.an.instanceOf(WPCOM);

      wpcom.site._id
        .should.be.eql(tdata.public_site);
    });
  });
});
