
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var Category = require('../lib/category');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

describe('WPCOM#Site#Category', function(){
  var category_added;

  // Create a new_category before to start tests
  var new_category;
  before(function(done){
    var site = WPCOM(test.site.private.token).site(test.site.private.id);
    var cat = site.category();

    cat.add(test.new_category_data, function(err, category) {
      if (err) throw err;

      new_category = category;
      done();
    });
  });

  after(function(done){
    var site = WPCOM(test.site.private.token).site(test.site.private.id);
    var cat = site.category(new_category.slug);

    // clean new_category category
    cat.delete(function(err, category) {
      if (err) throw err;

      done();
    });
  });

  describe('async', function(){

    describe('category.get()', function(){

      it('should get added category', function(done){
        var site = util.private_site();
        var cat = site.category(new_category.slug);

        cat.get(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data instanceof Object, 'data is not an object');
          assert.equal(new_category.slug, data.slug);
          assert.equal(new_category.name, data.name);
          done();
        });
      });

    });

    describe('category.add()', function(){

      it('should add a new category', function(done){
        var site = util.private_site();
        var category = site.category();
        test.new_category_data.name += '- Added';
        category.add(test.new_category_data, function(err, data){
          if (err) throw err;

          // checking some data date
          assert.ok(data);
          assert.ok(data instanceof Object, 'data is not an object');

          // store added catogory
          category_added = data;

          done();
        });
      });

    });

    describe('category.update()', function(){

      it('should edit the new added category', function(done){
        var site = util.private_site();
        var category = site.category(category_added.slug);

        var new_name = 'new category name';

        category.update({ name: new_name }, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal(new_name, data.name);

          // update added category
          category_added = data;

          done();
        });
      });

    });

    describe('category.delete()', function(){

      it('should delete the new added category', function(done){
        var site = util.private_site();
        var cat = site.category(category_added.slug);

        cat.delete(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal('true', data.success);
          assert.equal(category_added.slug, data.slug);

          done();
        });
      });

    });

  });

});
