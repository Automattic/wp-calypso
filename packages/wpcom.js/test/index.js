/**
 * WPCONN module
 */

var WPCONN = require('../');

/**
 * Testing data
 */

var tdata = require('./data');
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
      var wpconn = new WPCONN();
      var token = tdata.token;
      wpconn.token(token);

      wpconn.tkn
        .should.be.ok
        .and.be.instanceOf(String)
        .eql(token);
    });
  });

  describe('async', function(){

    describe('me', function(){
      it('should require user object', function(done){
        var wpconn = util.wpconn();

        wpconn.me(function(err, me){
          if (err) throw err;

          // testing object
          me
            .should.be.ok
            .and.an.instanceOf(Object);

          // testing user data
          me.ID
            .should.be.an.instanceOf(Number);

          done();
        });
      });
    });
  });
});
