
/**
 * Module dependencies.
 */

var photon = require('../');
var assert = require('assert');

describe('photon()', function () {

  it('should be a "function"', function () {
    assert('function' === typeof photon);
  });

  it('should not Photon-ify a Photon URL', function () {
    var url = 'https://i0.wp.com/www.gravatar.com/avatar/693307b4e0cb9366f34862c9dfacd7fc';
    assert(photon(url) === url);
  });
});
