
/**
 * Module dependencies
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * Create a `Site` instance
 */

describe('wpcom.site.batch', function(){
  it('should require site data', function(done){
    var wpcom = WPCOM();
    var batch = wpcom.batch();
    var site = wpcom.site(fixture.site.url);

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