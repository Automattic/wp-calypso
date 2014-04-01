
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
 * me
 */

describe('me', function(){

  describe('async', function(){

    describe('info', function(){
      it('should require user object', function(done){
        var wpconn = util.wpconn();

        wpconn.me.info(function(err, me){
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
