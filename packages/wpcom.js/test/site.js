

/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');
var util = require('./util');

/**
 * Testing data
 */

var tdata = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Create a `Site` instance
 */

describe('site', function(){

  describe('sync', function(){

    it('should be an instance of `Site`', function(){
      var wpconn = new WPCONN();
      wpconn.site.should.be.an.instanceOf(Site);
    });

    it('should be set site identifier', function(){
      var wpconn = new WPCONN();
      wpconn.site.setId(tdata.public_site);
      wpconn.site.id
        .should.be.eql(tdata.public_site);
    });

  });

  describe('async', function(){

    describe('info', function(){
      it('should require site data', function(done){
        var wpconn = new WPCONN();
        var site = wpconn.site;

        site.setId(tdata.public_site);

        site.info(function(err, info){
          if (err) throw err;

          // check site info
          info.ID
            .should.be.an.instanceOf(Number);

          info.name
            .should.be.an.instanceOf(String);
          done();
        });
      });
    });

    describe('posts', function(){

      it('should request posts list', function(done){
        var wpconn = util.public_site();

        wpconn.site.posts(function(err, list){
          if (err) throw err;

          // list object data testing
          list
            .should.be.an.instanceOf(Object);

          // `posts list` object data testing
          list.found
            .should.be.an.instanceOf(Number);

          list.posts
            .should.be.an.instanceOf(Array);

          done();
        });
      });

      it('should request only one post', function(done){
        var wpconn = util.public_site();

        wpconn.site.posts({ number: 1 }, function(err, list){
          if (err) throw err;

          // list object data testing
          list
            .should.be.an.instanceOf(Object);

          // `posts list` object data testing
          list.found
            .should.be.an.instanceOf(Number);

          // get only one post
          list.posts
            .should.be.an.instanceOf(Array)
            .and.length(1);

          done();
        });
      });
    });
  });

});
