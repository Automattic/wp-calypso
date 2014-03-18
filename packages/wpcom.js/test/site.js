

/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');

/**
 * Testing data
 */

var wpapp = require('./data');

/**
 * WPCONN instance
 */

var wpconn = new WPCONN();

/**
 * Create a `Site` instance
 */

describe('site', function(){
  it('should be an instance of `Site`', function(){
    var wpconn = new WPCONN();
    wpconn.site.should.be.an.instanceOf(Site);
  });

  it('should be set site identifier', function(){
    var wpconn = new WPCONN();
    var id = 'koke.me';
    wpconn.site.setId('koke.me');

    wpconn.site.id
      .should.be.eql('koke.me');
  });

  it('should require site data', function(done){
    var wpconn = new WPCONN();
    var site = wpconn.site;

    site.setId('koke.me');

    site.get(function(err, data){
      if (err) throw err;

      done();
    });
  });
});
