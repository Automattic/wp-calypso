
/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');
var Post = require('../lib/post');
var util = require('./util');

/**
 * Testing data
 */

var test = require('./data');

/**
 * WPCONN instance
 */

describe('post', function(){

  // Create a new_post before to start the tests
  var new_post;
  before(function(done){
    var wpconn = util.private_site();
    wpconn.site.post.add(test.new_post_data, function(err, post){
      if (err) done(err);

      new_post = post;
      done();
    });
  });

  describe('sync', function(){

    it('should be an instance of `Site`', function(){
      var wpconn = WPCONN();
      wpconn.site.post
        .should.be.an.instanceOf(Post);
    });

  });

  describe('async', function(){

    describe('get', function(){
      it('should get the recently added post', function(done){
        var wpconn = util.private_site();
        wpconn.site.post.get(new_post.ID, function(err, post){
          if (err) throw err;

          post.should.be.eql(new_post);
          done();
        });
      });

      it('should get by slug', function(done){
        var wpconn = util.private_site();
        wpconn.site.post.getBySlug(new_post.slug, function(err, post){
          if (err) throw err;

          post.should.be.eql(new_post);
          done();
        });
      });

    });

    describe('add', function(){

      it('should add a new post', function(done){
        var wpconn = util.private_site();
        wpconn.site.post.add(test.new_post_data, function(err, post){
          if (err) throw err;

          // checking some post date
          post
            .should.be.ok
            .and.be.an.instanceOf(Object);

          post.ID
            .should.be.an.instanceOf(Number);

          post.site_ID
            .should.be.an.instanceOf(Number)
            .and.be.eql(test.private_site_id);

          done();
        });
      });

    });

    describe('edit', function(){

      it('should edit the new added post', function(done){
        var wpconn = util.private_site();
        var edited_title = new_post.title + ' has been changed';

        wpconn.site.post.edit(new_post.ID, { title: edited_title }, function(err, post){
          if (err) throw err;

          post
            .should.be.ok
            .and.be.an.instanceOf(Object);

          post.title
            .should.be.eql(edited_title);

          done();
        });
      });

    });

    describe('delete', function(){

      it('should delete the new added post', function(done){
        var wpconn = util.private_site();

        wpconn.site.post.del(new_post.ID, function(err, post){
          if (err) throw err;

          post
            .should.be.ok
            .and.be.an.instanceOf(Object);

          post.ID
            .should.be.eql(new_post.ID);

          done();
        });
      });

    });

  });

});
