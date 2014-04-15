
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
 * me
 */

describe('WPCOM#Me', function(){

  describe('async', function(){

    describe('get()', function(){
      it('should require user information object', function(done){
        var me = util.wpcom().me();

        me.get(function(err, me){
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

    describe('sites()', function(){
      it('should require user sites object', function(done){
        var me = util.wpcom().me();

        me.sites(function(err, sites){
          if (err) throw err;
          done();
        });
      });
    });

    describe('likes()', function(){
      it('should require user likes', function(done){
        var me = util.wpcom().me();

        me.likes(function(err, data){
          if (err) throw err;

          data.found
            .should.be.an.instanceOf(Number);

          data.likes
            .should.be.an.instanceOf(Array);

          done();
        });
      });
    });

    describe('groups()', function(){
      it('should require groups', function(done){
        var me = util.wpcom().me();

        me.groups(function(err, data){
          if (err) throw err;

          data.groups
            .should.be.an.instanceOf(Array);

          done();
        });
      });
    });

    describe('connections()', function(){
      it('should require third-party connections', function(done){
        var me = util.wpcom().me();

        me.connections(function(err, data){
          if (err) throw err;

          data.connections
            .should.be.an.instanceOf(Array);

          done();
        });
      });
    });

  });

});
