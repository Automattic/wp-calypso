
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
  return WPCOM(test.global);
};

/**
 * Create a new WPCOM instance
 * Create a site instance object
 *
 * @api public
 */

Util.public_site = function(){
  var wpcom = WPCOM(test.site.private.token);
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
  site.addPost(test.new_post_data, function(err, post){
    if (err) return fn(err);

    site
    .post(post.ID)
    .comment()
    .add('Really nice testing post !!', function(err, comment){
      if (err) return fn(err);

      fn (null, post, comment);
    });

  });
};

/**
 * Add a new media
 */

Util.addMedia = function(fn){
  var site = Util.private_site();
  var file = test.new_media_data.files[1];
  file = file._readableState ? file : fs.createReadStream(file);

  site.addMediaFiles(file, fn);
};

/**
 * Get media files
 */

Util.getFiles = function(){
  // pre-process files array
  var files = [];
  for (var i = 0; i < test.new_media_data.files.length; i++) {

    var f = test.new_media_data.files[i];
    if ('string' == typeof f) {
      files.push(fs.createReadStream(f));
    } else {
      files.push({
        title: f.title,
        description: f.description,
        caption: f.caption,
        file: fs.createReadStream(f.file)
      });
    }
  }

  return files;
};

/**
 * Export module
 */

module.exports = Util;
