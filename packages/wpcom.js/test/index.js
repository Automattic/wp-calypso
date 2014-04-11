/**
 * WPCOM module
 */

var WPCOM = require('../');

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
      wpcom.should.be.instanceof(WPCOM);
    });

    it('should set the token', function(){
      var wpcom = new WPCOM(test.token);
      wpcom.tkn
        .should.be.ok
        .and.be.instanceOf(String)
        .eql(test.token);
    });

  });

});
