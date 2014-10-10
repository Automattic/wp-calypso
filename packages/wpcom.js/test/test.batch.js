
/**
 * Module dependencies
 */

var Site = require('../lib/site');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

/**
 * Create a `Site` instance
 */

describe('WPCOM#Site', function(){

  describe('async', function(){

    describe('wpcom.batch()', function(){
      it('should require site data', function(done){

        var wpcom = util.wpcom();
        var batch = wpcom.batch();

        var site = util.public_site();

        var url_site = '/sites/' + site._id;
        var url_posts = '/sites/' + site._id + '/posts';
        var url_me = '/me';

        batch
        .add(url_site)
        .add(url_posts)
        .add(url_me)
        .run(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data[url_site]);
          assert.ok(data[url_posts]);
          assert.ok(data[url_me]);

          done();
        });
      });
    });

  });

});

