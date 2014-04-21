
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Sites = require('../lib/sites');
var Media = require('../lib/media');
var util = require('./util');

/**
 * Testing data
 */

var test = require('./data');

/**
 * WPCOM instance
 */

describe('WPCOM#Sites#Media', function(){

  // Create a new_media before to start the tests

  var new_media;
  before(function(done){
    util.addMedia(function(err, media) {
      if (err) return done(err);

      console.log('-> media -> ', media);
      new_media = media;
      done();
    });
  });

  describe('sync', function(){

    it('should create an `Media` instance from `Sites`', function(){
      var media = WPCOM().sites().media();
      media
        .should.be.an.instanceOf(Media);
    });

  });

});
