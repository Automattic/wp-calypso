
/**
 * Module dependencies
 */

var util = require('./util');
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
  var wpcom = util.wpcom();
  var me = wpcom.me();

  describe('wpcom.me.get', function(){
    it('should require user information object', done => {
      me.get()
        .then(me => {
          // testing object
          assert.ok(me);
          assert.equal('object', typeof me);

          // testing user data
          assert.equal('number', typeof me.ID);

          done();
        })
        .catch(done);
    });

    it('should require user passing query parameter', done => {
      me.get({ context: 'info' })
        .then(me => {
          // testing object
          assert.ok(me);
          assert.equal('object', typeof me);

          // testing user data
          assert.equal('number', typeof me.ID);

          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.me.sites', function(){
    it('should require user sites object', done => {
      me.sites()
        .then(() => done())
        .catch(done);
    });
  });

  describe('wpcom.me.likes', function(){
    it('should require user likes', done => {
      me.likes()
        .then(data => {
          assert.equal('number', typeof data.found);
          assert.equal('object', typeof data.likes);
          assert.ok(data.likes instanceof Array);

          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.me.groups', function(){
    it('should require groups', done => {
      me.groups()
        .then(data => {
          assert.equal('object', typeof data.groups);
          assert.ok(data.groups instanceof Array);

          done();
        })
        .catch(done);
    });
  });

  describe('wpcom.me.connections', function(){
    it('should require third-party connections', done => {
      me.connections()
        .then(data => {
          assert.equal('object', typeof data.connections);
          assert.ok(data.connections instanceof Array);

          done();
        })
        .catch(done);
    });
  });

});
