
/**
 * Module dependecies
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * WPCOM object
 */

describe('wpcom', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var testing_post;

  describe('wpcom.util.req.post', function(){

    describe('create a post without query {} and body {}', function(){
      it('should get 400 error code', function(done){

        var path = '/sites/' + site._id + '/posts/new';
        wpcom.req.post(path, function(err, data){
          assert.ok(err);
          assert.equal(400, err.statusCode);
          done();
        });

      });
    });

    describe('create a post without query {}', function(){
      it('should create a new post', function(done){

        var path = '/sites/' + site._id + '/posts/new';
        wpcom.req.post(path, null, fixture.post, function(err, data){
          if (err) throw err;

          testing_post = data;
          assert.ok(data);
          done();
        });

      });
    });

  });

  describe('wpcom.util.req.del', function(){
    it('should delete added post', function(done){
      var path = '/sites/' + site._id + '/posts/' + testing_post.ID + '/delete';
      wpcom.req.post(path,  function(err, data){
        if (err) throw err;

        assert.ok(data.ID, testing_post.ID);
        done();
      });

    });
  });

});