
/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * WPCOM object
 */

describe('wpcom', function(){

  describe('wpcom.freshlyPressed', function(){
    it('should require freshly pressed', function(done){
      var wpcom = WPCOM();

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