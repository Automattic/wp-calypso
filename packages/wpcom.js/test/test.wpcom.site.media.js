
/**
 * WPCOM module
 */

var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * WPCOM instance
 */

describe('wpcom.site.media', function(){
  // Global instances
  var wpcom = util.wpcom();
  var site = wpcom.site(util.site());
  var add_urls_array;
  var add_urls_object;

  // Create a testing_media before to start tests

  var testing_media;
  before(function(done){
    site.addMediaFiles(fixture.media.files[1], function(err, data) {
      if (err) throw err;

      testing_media = data ? data.media[0] : {};
      done();
    });
  });

  after(function(done){
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

  describe('wpcom.site.media.get', function(){
    it('should get added media', function(done){
      var media = site.media(testing_media.ID);
      media.get(function(err, data){
        if (err) throw err;

        assert.equal(testing_media.ID, data.ID);
        done();
      });
    });
  });

  describe('wpcom.site.media.update', function(){
    it('should edit the media title', function(done){
      var edited_title = "This is the new title";

      site
      .media(testing_media.ID)
      .update({ apiVersion: '1.1' }, { title: edited_title }, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(edited_title, data.title);

        done();
      });
    });
  });

  describe('wpcom.site.media.addFiles', function(){
    it('should create a new media from a file', function(done){
      site
      .media()
      .addFiles(fixture.media.files, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.media instanceof Array);
        assert.equal(fixture.media.files.length, data.media.length);
        done();
      });
    });
  });

  describe('wpcom.site.media.addUrls', function(){
    it('should create a new media from an object', function(done){
      var media_object = fixture.media.urls[1];

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

  describe('wpcom.site.media.addUrls', function(){
    it('should create a new media', function(done){
      site
      .media()
      .addUrls(fixture.media.urls, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data.media instanceof Array);
        assert.equal(fixture.media.urls.length, data.media.length);

        add_urls_array = data;

        done();
      });
    });
  });

  describe('wpcom.site.media.delete', function(){
    it('should delete a media', function(done){
      site
      .media(testing_media.ID)
      .del(function(err, data){
        if (err) throw err;

        assert.equal(testing_media.ID, data.ID);
        done();
      });
    });
  });

});
