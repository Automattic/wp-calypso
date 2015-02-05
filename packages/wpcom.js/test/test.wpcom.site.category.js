
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var assert = require('assert');

/**
 * Testing data
 */

var fixture = require('./fixture');

describe('wpcom.site.category', function() {
  // Global instances
  var wpcom = WPCOM(fixture.site.token);
  var site = wpcom.site(fixture.site.url);
  var new_category;

  // Create a testing_category before to start tests
  var testing_category;
  before(function(done){
    site.category()
    .add(fixture.category, function(err, category) {
      if (err) throw err;

      testing_category = category;
      done();
    });
  });

  // Delete testing category
  after(function(done){
    site.category(testing_category.slug)
    .delete(function(err, category) {
      if (err) throw err;

      done();
    });
  });

  
  describe('wpcom.site.category.get', function(){
    it('should get added category', function(done){
      site.category(testing_category.slug)
      .get(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.ok(data instanceof Object, 'data is not an object');
        assert.equal(testing_category.slug, data.slug);
        assert.equal(testing_category.name, data.name);
        done();
      });
    });
  });

  describe('wpcom.site.category.add', function(){
    it('should add a new category', function(done){
      var category = site.category();

      fixture.category.name += '-added';
      category.add(fixture.category, function(err, data){
        if (err) throw err;

        // checking some data date
        assert.ok(data);
        assert.ok(data instanceof Object, 'data is not an object');

        // store added catogory
        new_category = data;

        done();
      });
    });
  });

  describe('wpcom.site.category.update', function(){
    it('should edit the new added category', function(done){
      var category = site.category(new_category.slug);
      var edited_name = fixture.category.name + '-updated';

      category.update({ name: edited_name }, function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal(edited_name, data.name);

        // update added category
        new_category = data;

        done();
      });
    });
  });

  describe('wpcom.site.category.delete', function(){
    it('should delete the new added category', function(done){
      site.category(new_category.slug)
      .delete(function(err, data){
        if (err) throw err;

        assert.ok(data);
        assert.equal('true', data.success);
        assert.equal(new_category.slug, data.slug);

        done();
      });
    });
  });

});