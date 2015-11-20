
/*!
 * Endpoint root
 */

var root = '/me/settings/profile-links';

/**
 * `ProfileLinks` constructor.
 *
 * @param {WPCOM} wpcom
 * @public
 */

function ProfileLinks(wpcom) {
  if (!(this instanceof ProfileLinks)) {
    return new ProfileLinks(wpcom);
  }

  this.wpcom = wpcom;
}

/**
 * Get profile links of the current user.
 *
 * *Example:*
 *   // Get profile links of the current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .get(function(err, data) {
 *      // profile links data
 *    });
 *
 * @param {Object} [query]
 * @param {Function} fn
 * @public
 */

ProfileLinks.prototype.get = function (query, fn) {
  return this.wpcom.req.get(root, query, fn);
};

// Create `mine` alias
ProfileLinks.prototype.mine = ProfileLinks.prototype.get;

/**
 * Add a profile link to current user.
 *
 * *Example:*
 *    // Add profile link to current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .add({
 *      title: "WordPress Blog",
 *      value: "en.blog.wordpress.com"
 *    }, function(err, data) {
 *      // profile has been added
 *    });
 *
 * @param {Array|Object} links - profile links
 * @param {Object} [query]
 * @param {Function} fn
 * @public
 */

ProfileLinks.prototype.add = function (links, query, fn) {
  // query object is optional
  if ('function' === typeof query) {
    fn = query;
    query = {};
  }

  // links can be Array or an Object
  if (!(links instanceof Array)) {
    links = [links];
  }

  // Set api version 1.2 for this endpoint
  query.apiVersion = '1.2';

  var path = root + '/new';
  return this.wpcom.req.post(path, query, { links: links }, fn);
};

/**
 * Remove your ProfileLinks from a Post.
 *
 * *Example:*
 *    // Remove profile link from current user
 *    wpcom
 *    .me()
 *    .settings()
 *    .profileLinks()
 *    .del('httpen-blog-wordpress-com', function(err, data) {
 *      // profile has been deleted
 *    });
 *
 * @param {String} slug
 * @param {Object} [query]
 * @param {Function} fn
 * @public
 */

ProfileLinks.prototype.del = function (slug, query, fn) {
  if ('function' === typeof query) {
    fn = query;
    query = {};
  }

  var path = root + '/' + slug + '/delete';
  return this.wpcom.req.del(path, query, fn);
};

// Create `delete` alias
ProfileLinks.prototype['delete'] = ProfileLinks.prototype.del;

/*!
 * Expose `ProfileLinks` module
 */

module.exports = ProfileLinks;