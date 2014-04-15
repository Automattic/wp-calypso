
/**
 * Module dependencies
 */

var test = require('./data');
var WPCOM = require('../');

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
  return wpcom.sites(test.site.public.url);
};

/**
 * Create a new WPCOM instance
 * setting with a private site id
 *
 * @api public
 */

Util.private_site = function(){
  var wpcom = WPCOM(test.token.private);
  return wpcom.sites(test.site.private.url);
};

/**
 * Add a new post
 */

Util.addPost = function(fn){
  var site = Util.private_site();
  var post = site.post();
  post.add(test.new_post_data, fn);
};

/**
 * Export module
 */

module.exports = Util;
