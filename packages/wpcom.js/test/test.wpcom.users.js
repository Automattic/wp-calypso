
/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

/**
 * me
 */

describe('wpcom.users', function () {
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var users = wpcom.users();

  describe('wpcom.users.suggets', function() {
    it('should get a list of possible users to suggest.', function (done) {
      users.suggest(function (err, data) {
        if (err) throw err;

        assert.ok(data);
        assert.equal('object', typeof data.suggestions);
        assert.ok(data.suggestions instanceof Array);

        done();
      });
    });
  });

});