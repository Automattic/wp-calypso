

/**
 * WPCONN module
 */

var WPCONN = require('../');
var Site = require('../lib/site');

/**
 * Testing data
 */

var tdata = require('./data');

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
    wpconn.site.setId(tdata.site);
    wpconn.site.id
      .should.be.eql(tdata.site);
  });

  it('should require site data', function(done){
    var wpconn = new WPCONN();
    var site = wpconn.site;

    site.setId(tdata.site);

    site.get(function(err, data){
      if (err) throw err;
      done();
    });
  });
});
