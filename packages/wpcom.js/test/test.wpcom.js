
/**
 * WPCOM module
 */

var util = require('./util');
var assert = require('assert');

/**
 * WPCOM object
 */

describe('wpcom', function(){

  describe('wpcom.freshlyPressed', function(){
    it('should require freshly pressed', function(done){
      var wpcom = util.wpcom_public();

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
