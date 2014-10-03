
/**
 * WPCOM module
 */

var WPCOM = require('../');
var Site = require('../lib/site');
var Tag = require('../lib/tag');
var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */

var test = require('./data');

describe('WPCOM#Site#Tag', function(){
  var tag_added;

  // Create a new_tag before to start tests
  var new_tag;
  before(function(done){
    var site = WPCOM(test.site.private.token).site(test.site.private.id);
    var cat = site.tag();

    cat.add(test.new_tag_data, function(err, tag) {
      if (err) throw err;

      new_tag = tag;
      done();
    });
  });

  after(function(done){
    var site = WPCOM(test.site.private.token).site(test.site.private.id);
    var cat = site.tag(new_tag.slug);

    // clean new_tag tag
    cat.delete(function(err, tag) {
      if (err) throw err;

      done();
    });
  });

  describe('async', function(){

    describe('tag.get()', function(){

      it('should get added tag', function(done){
        var site = util.private_site();
        var cat = site.tag(new_tag.slug);

        cat.get(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.ok(data instanceof Object, 'data is not an object');
          assert.equal(new_tag.slug, data.slug);
          assert.equal(new_tag.name, data.name);
          done();
        });
      });

    });

    describe('tag.add()', function(){

      it('should add a new tag', function(done){
        var site = util.private_site();
        var tag = site.tag();
        test.new_tag_data.name += '- Added';
        tag.add(test.new_tag_data, function(err, data){
          if (err) throw err;

          // checking some data date
          assert.ok(data);
          assert.ok(data instanceof Object, 'data is not an object');

          // store added catogory
          tag_added = data;

          done();
        });
      });

    });

    describe('tag.update()', function(){

      it('should edit the new added tag', function(done){
        var site = util.private_site();
        var tag = site.tag(tag_added.slug);

        var new_name = 'new tag name';

        tag.update({ name: new_name }, function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal(new_name, data.name);

          // update added tag
          tag_added = data;

          done();
        });
      });

    });

    describe('tag.delete()', function(){

      it('should delete the new added tag', function(done){
        var site = util.private_site();
        var cat = site.tag(tag_added.slug);

        cat.delete(function(err, data){
          if (err) throw err;

          assert.ok(data);
          assert.equal('true', data.success);
          assert.equal(tag_added.slug, data.slug);

          done();
        });
      });

    });

  });

});
