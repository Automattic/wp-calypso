
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
  before( done => {
    site.addMediaFiles(fixture.media.files[1])
      .then( data => {
        testing_media = data ? data.media[0] : {};
        done();
      })
      .catch(done);
  });

  after( done => {
    // clean media added through of array by urls
    site.deleteMedia(add_urls_array.media[0].ID)
      .then( () => site.deleteMedia(add_urls_array.media[1].ID) )
      .then( () => site.deleteMedia(add_urls_array.media[2].ID) )
      .then( () => site.deleteMedia(add_urls_object.media[0].ID) )
      .then( () => done() )
      .catch(done);
  });

  describe('wpcom.site.media.get', function(){
    it('should get added media', done => {
      var media = site.media(testing_media.ID);
      media.get()
        .then( data => {
          assert.equal(testing_media.ID, data.ID);
          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.site.media.update', function(){
    it('should edit the media title', done => {
      var edited_title = "This is the new title";

      site.media(testing_media.ID).update({ apiVersion: '1.1' }, { title: edited_title })
        .then( data => {
          assert.ok(data);
          assert.equal(edited_title, data.title);

          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.site.media.addFiles', function(){
    it('should create a new media from a file', done => {
      site.media().addFiles(fixture.media.files)
        .then( data => {
          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(fixture.media.files.length, data.media.length);
          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.site.media.addUrls', function(){
    it('should create a new media from an object', done => {
      var media_object = fixture.media.urls[1];

      site.media().addUrls(media_object)
        .then( data => {
          assert.ok(data);
          add_urls_object = data;
          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.site.media.addUrls', function(){
    it('should create a new media', done => {
      site.media().addUrls(fixture.media.urls)
        .then( data => {
          assert.ok(data);
          assert.ok(data.media instanceof Array);
          assert.equal(fixture.media.urls.length, data.media.length);

          add_urls_array = data;

          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.site.media.delete', function(){
    it('should delete a media', done => {
      site.media(testing_media.ID).del()
        .then( data => {
          assert.equal(testing_media.ID, data.ID);
          done();
        })
        .catch(done);
    });
  });

});
