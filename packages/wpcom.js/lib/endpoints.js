
/**
 * Endpoints object
 */

var endpoints = {
  "me": {
    "type": "GET",
    "path": "/me"
  },
  "posts": {
    "type": "GET",
    "path": "/sites/%site%/posts"
  },
  "post": {
    "type": "GET",
    "path": "/sites/%site%/posts/%post_ID%"
  }
};

/**
 * Expose module
 */

module.exports = endpoints;
