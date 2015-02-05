
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

describe('wpcom.me', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var me = wpcom.me();

  describe('wpcom.me.get', function(){
    it('should require user information object', function(done){
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

    it('should require user passing query parameter', function(done){
      me.get({ context: 'info' }, function(err, me){
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

  describe('wpcom.me.sites', function(){
    it('should require user sites object', function(done){
      me.sites(function(err, sites){
        if (err) throw err;
        done();
      });
    });
  });

  describe('wpcom.me.likes', function(){
    it('should require user likes', function(done){
      me.likes(function(err, data){
        if (err) throw err;

        assert.equal('number', typeof data.found);
        assert.equal('object', typeof data.likes);
        assert.ok(data.likes instanceof Array);

        done();
      });
    });
  });

  describe('wpcom.me.groups', function(){
    it('should require groups', function(done){
      me.groups(function(err, data){
        if (err) throw err;

        assert.equal('object', typeof data.groups);
        assert.ok(data.groups instanceof Array);

        done();
      });
    });
  });

  describe('wpcom.me.connections', function(){
    it('should require third-party connections', function(done){
      me.connections(function(err, data){
        if (err) throw err;

        assert.equal('object', typeof data.connections);
        assert.ok(data.connections instanceof Array);

        done();
      });
    });
  });

});