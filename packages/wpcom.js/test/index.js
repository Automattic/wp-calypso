/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');
var util = require('./util');

/**
 * WPCOM object
 */

describe('WPCOM', function(){

  describe('sync', function(){

    it('should create a WPCOM object', function(){
      var wpcom = new WPCOM();
      assert.ok(wpcom instanceof WPCOM);
    });

    it('should set the token', function(){
      var wpcom = new WPCOM(test.token.global);
      assert.ok(wpcom.tkn);
      assert.equal('string', typeof wpcom.tkn);
      assert.equal(test.token.global, wpcom.tkn);
    });

  });

});
