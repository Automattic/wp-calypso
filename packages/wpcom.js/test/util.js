
/**
 * Module dependencies
 */

var test = require('./data');
var WPCOM = require('../');
var fs = require('fs');

/**
 * `Util` module
 */

function Util(){}

/**
 * Create a WPCOM instance
 *
 * @api public
 */

Util.wpcom = function(){
  return WPCOM(test.token.global);
};

/**
 * Create a new WPCOM instance
 * Create a site instance object
 *
 * @api public
 */

Util.public_site = function(){
  var wpcom = WPCOM(test.token.global);
  return wpcom.site(test.site.public.url);
};

/**
 * Create a new WPCOM instance
 * setting with a private site id
 *
 * @api public
 */

Util.private_site = function(){
  var wpcom = WPCOM(test.site.private.token);
  return wpcom.site(test.site.private.url);
};

/**
 * Add a new post
 */

Util.addPost = function(fn){
  var site = Util.private_site();
  site.addPost(test.new_post_data, fn);
};

/**
 * Add a new media
 */

Util.addMedia = function(fn){
  var site = Util.private_site();
  site.addMediaFiles(fs.createReadStream(test.new_media_data.files[0]), fn);
};

/**
 * Export module
 */

module.exports = Util;
