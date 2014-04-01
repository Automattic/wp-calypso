/**
 * WPCONN module
 */

var WPCONN = require('../');

/**
 * Testing data
 */

var test = require('./data');
var util = require('./util');

/**
 * WPCONN object
 */

describe('WPCONN', function(){

  describe('sync', function(){

    it('should create a WPCONN object', function(){
      var wpconn = new WPCONN();
      wpconn.should.be.instanceof(WPCONN);
    });

    it('should set the token', function(){
      var wpconn = new WPCONN(test.token);
      wpconn.tkn
        .should.be.ok
        .and.be.instanceOf(String)
        .eql(test.token);
    });

  });

});
