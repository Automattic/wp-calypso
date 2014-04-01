
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

    describe('info()', function(){
      it('should require user information object', function(done){
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

    describe('likes()', function(){
      it('should require user likes', function(done){
        var wpconn = util.wpconn();

        wpconn.me.likes(function(err, likes){
          if (err) throw err;

          likes.found
            .should.be.an.instanceOf(Number);

          likes.likes
            .should.be.an.instanceOf(Array);

          done();
        });
      });
    });

    describe('groups()', function(){
      it('should require groups', function(done){
        var wpconn = util.wpconn();

        wpconn.me.groups(function(err,groups){
          if (err) throw err;

          groups.groups
            .should.be.an.instanceOf(Array);

          done();
        });
      });
    });

  });

});
