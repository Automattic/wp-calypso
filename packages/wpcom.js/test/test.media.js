
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var Media = require('../lib/media');
var util = require('./util');
var fs = require('fs');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

/**
 * WPCOM instance
 */

describe('WPCOM#Site#Media', function(){
  var add_urls_array;
  var add_urls_object;

  // Create a new_media before to start the tests

  var new_media;
  before(function(done){
    util.addMedia(function(err, media) {
      if (err) throw err;

      new_media = media;
      done();
    });
  });

  after(function(done){
    var site = util.private_site();

    // clean media added through of array by urls
    site.deleteMedia(add_urls_array.media[0].ID, function(err, data) {
      if (err) throw err;

      site.deleteMedia(add_urls_array.media[1].ID, function(err, data) {
        if (err) throw err;

        site.deleteMedia(add_urls_array.media[2].ID, function(err, data) {
          if (err) throw err;

          site.deleteMedia(add_urls_object.media[0].ID, function(err, data) {
            if (err) throw err;

            done();
          });

        });

      });

    });

  });

  describe('sync', function(){

    it('should create an `Media` instance from `Site`', function(){
      var media = WPCOM().site().media();
      assert.ok(media instanceof Media);
    });

  });

  describe('async', function(){

    describe('media.get()', function(){

      it('should get added media', function(done){
        var site = util.private_site();
        var media = site.media(test.media_id);

        media.get(function(err, info){
          if (err) throw err;

          assert.equal(3, info.ID);
          done();
        });
      });

    });

    describe('media.update()', function(){

      it('should edit the media title', function(done){
        var site = util.private_site();
        var edited_title = "This is the new title";

        site
        .media(new_media.media[0].ID)
        .update({ apiVersion: '1.1' }, { title: edited_title }, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal(edited_title, data.title);

          done();
        });
      });

    });

    describe('media.addFiles([fs])', function(){

      it('should create a new media from a file', function(done){
        var site = util.private_site();

        site
        .media()
        .addFiles(test.new_media_data.files, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(test.new_media_data.files.length, data.media.length);
          done();
        });

      });

    });

    describe('media.addUrls(object)', function(){

      it('should create a new media from an object', function(done){
        var site = util.private_site();
        var media_object = test.new_media_data.media_urls[1];

        site
        .media()
        .addUrls(media_object, function(err, data){
          if (err) throw err;

          assert.ok(data);
          add_urls_object = data;
          done();
        });
      });

    });

    describe('media.addUrls(["url1", {object}, "url2"])', function(){

      it('should create a new media', function(done){
        var site = util.private_site();

        site
        .media()
        .addUrls(test.new_media_data.media_urls, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(test.new_media_data.media_urls.length, data.media.length);

          add_urls_array = data;

          done();
        });

      });

    });

    describe('media.delete()', function(){

      it('should delete a media', function(done){
        var site = util.private_site();

        site
        .media(new_media.media[0].ID)
        .del(function(err, data){
          if (err) throw err;

          assert.equal(new_media.media[0].ID, data.ID);
          done();
        });

      });

    });

  });

});
