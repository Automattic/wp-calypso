
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

      wpcom.freshlyPressed()
        .then( data => {
          // testing object
          assert.ok(data);
          assert.equal('number', typeof data.number);
          assert.ok(data.posts instanceof Array);
          done();
        })
        .catch(done);
    });
  });

});
