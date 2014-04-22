
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
          assert.ok(me);
          assert.equal('object', typeof me);

          // testing user data
          assert.equal('number', typeof me.ID);

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

          assert.equal('number', typeof data.found);
          assert.equal('object', typeof data.likes);
          assert.ok(data.likes instanceof Array);

          done();
        });
      });
    });

    describe('groups()', function(){
      it('should require groups', function(done){
        var me = util.wpcom().me();

        me.groups(function(err, data){
          if (err) throw err;

          assert.equal('object', typeof data.groups);
          assert.ok(data.groups instanceof Array);

          done();
        });
      });
    });

    describe('connections()', function(){
      it('should require third-party connections', function(done){
        var me = util.wpcom().me();

        me.connections(function(err, data){
          if (err) throw err;

          assert.equal('object', typeof data.connections);
          assert.ok(data.connections instanceof Array);

          done();
        });
      });
    });

  });

});
