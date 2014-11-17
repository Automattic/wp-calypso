
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

  describe('async', function(){

    describe('freshlyPressed()', function(){
      it('should require freshly pressed', function(done){
        var wpcom = util.wpcom();

        wpcom.freshlyPressed(function(err, data){
          if (err) throw err;

          // testing object
          assert.ok(data);
          assert.equal('number', typeof data.number);
          assert.ok(data.posts instanceof Array);
          done();
        });
      });

    });

  });

});
