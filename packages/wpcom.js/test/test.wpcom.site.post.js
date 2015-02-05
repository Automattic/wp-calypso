
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * WPCOM instance
 */

describe('wpcom.site.post', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var new_post;
  var site_ID;
  var testing_post;

  // Create a testing_post before to start the tests
  before(function(done){
    site.addPost(fixture.post, function (err, data_post) {
      if (err) throw err;

      testing_post = data_post;
      site.get(function(err, data_site){
        if (err) return done(err);

        site_ID = data_site.ID;
        done();
      });

    });
  });

  after(function(done){
    // delete testing_post post
    site.deletePost(testing_post.ID, function(err, post) {
      if (err) throw err;

      done();
    });
  });

  describe('wpcom.site.post.get', function(){
    it('should get added post (by id)', function(done){
      site
      .post(testing_post.ID)
      .get(function(err, data){
        if (err) throw err;

        assert.equal(testing_post.ID, data.ID);
        assert.equal(testing_post.site_ID, data.site_ID);
        done();
      });
    });

    it('should get passing a query object', function(done){
      site
      .post(testing_post.ID)
      .get({ content: 'edit' }, function(err, post){
        if (err) throw err;

        assert.equal(testing_post.ID, post.ID);
        assert.equal(testing_post.site_ID, post.site_ID);
        done();
      });
    });

    it('should get added post (by slug)', function(done){
      site
      .post({ slug: testing_post.slug })
      .get(function(err, post){
        if (err) throw err;

        assert.equal(testing_post.ID, post.ID);
        assert.equal(testing_post.site_ID, post.site_ID);
        done();
      });
    });
  });

  describe('wpcom.site.post.add', function(){
    it('should add a new post', function(done){
      fixture.post.title += '-added';

      site
      .post()
      .add(fixture.post, function(err, data){
        if (err) throw err;

        // checking some data date
        assert.ok(data);
        assert.ok(data instanceof Object, 'data is not an object');
        assert.equal(site_ID, data.site_ID);
        new_post = data;

        done();
      });
    });

  });

  describe('wpcom.site.post.update', function(){
    it('should edit the new added post', function(done){
      var new_title = fixture.post.title + '-updated';
      site
      .post(testing_post.ID)
      .update({ title: new_title }, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(new_title, data.title);

        done();
      });
    });
  });

  describe('wpcom.site.post.delete', function(){
    it('should delete the new added post', function(done){
      site
      .post(testing_post.ID)
      .delete(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(testing_post.ID, data.ID);

        done();
      });
    });
  });

  describe('wpcom.site.post.restore', function(){
    it('should restore a post from trash', function(done){
      var post = site.post();
      post.add(fixture.post, function(err, data1){
        if (err) throw err;

        assert.equal(post._id, data1.ID);

        post.delete(function(err, data2){
          if (err) throw err;

          assert.equal(post._id, data2.ID);

          post.restore(function(err, data3){
            if (err) throw err;

            assert.ok(data3);
            assert.equal(post._id, data3.ID);
            assert.equal(testing_post.status, data3.status);

            post.delete(function(err, data4){
              if (err) throw err;

              assert.equal(post._id, data4.ID);
              done();
            });
          });
        });
      });
    });
  });

});