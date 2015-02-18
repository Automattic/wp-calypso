
/**
 * WPCOM module
 */

var WPCOM = require('../');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

describe('wpcom.site.tag', function(){
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var new_tag;

  // Create a testing_tag before to start tests
  var testing_tag;
  before(function(done){
    fixture.tag.name += Math.random() * 1000000 | 0;
    site.tag()
    .add(fixture.tag, function(err, tag) {
      if (err) throw err;

      testing_tag = tag;
      done();
    });
  });

  // Delete testing tag
  after(function(done){
    site.tag(testing_tag.slug)
    .delete(function(err, tag) {
      if (err) throw err;

      done();
    });
  });

  describe('wpcom.site.tag.get', function(){
    it('should get added tag', function(done){
      var cat = site.tag(testing_tag.slug);

      cat.get(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data instanceof Object, 'data is not an object');
        assert.equal(testing_tag.slug, data.slug);
        assert.equal(testing_tag.name, data.name);
        done();
      });
    });
  });

  describe('wpcom.site.tag.add', function(){
    it('should add a new tag', function(done){
      var tag = site.tag();
      fixture.tag.name += '-added';

      tag.add(fixture.tag, function(err, data){
        if (err) throw err;

        // checking some data date
        assert.ok(data);
        assert.ok(data instanceof Object, 'data is not an object');

        // store added catogory
        new_tag = data;

        done();
      });
    });
  });

  describe('wpcom.site.tag.update', function(){
    it('should edit the new added tag', function(done){
      var tag = site.tag(new_tag.slug);
      var edited_name = fixture.tag.name + '-updated';

      tag.update({ name: edited_name }, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(edited_name, data.name);

        // update added tag
        new_tag = data;

        done();
      });
    });
  });

  describe('wpcom.site.tag.delete', function() {
    it('should delete the new added tag', function(done) {
      var cat = site.tag(new_tag.slug);

      cat.delete(function(err, data) {
        if (err) throw err;

        assert.ok(data);
        assert.equal("true", data.success);
        assert.equal(new_tag.slug, data.slug);

        done();
      });
    });
  });

});