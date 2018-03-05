/** @format */

/**
 * External dependencies
 */

import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
import Searchable from '../';

var makeCollection = function() {
	var Collection = function() {
		this.items = [
			{
				title: 'this title',
				author: 'bob ralian',
				urls: {
					public: 'wordpress.com',
					private: 'notwordpress.com',
				},
				editor: {
					primary: 'Susan',
					secondary: 'Kyle',
				},
			},
			{
				title: 'another title',
				author: 'Jill',
				urls: {
					public: 'test.com',
					private: 'blah.com',
				},
				editor: {
					primary: 'Edith',
					secondary: 'Susan',
				},
			},
		];
	};

	Collection.prototype.get = function() {
		return this.items;
	};

	return Collection;
};

describe( 'index', () => {
	describe( 'searchNodes as array', () => {
		test( 'should find node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title', 'author' ] );
			collection = new Collection();
			assert.equal( collection.search( 'Jill' ).length, 1 );
			assert.equal( collection.search( 'another' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		test( 'should not find a node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title', 'author' ] );
			collection = new Collection();
			assert.equal( collection.search( 'foo' ).length, 0 );
		} );
	} );

	describe( 'searchNodes as string', () => {
		test( 'should find node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, 'title' );
			collection = new Collection();
			assert.equal( collection.search( 'another' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		test( 'should not find a node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, 'title' );
			collection = new Collection();
			assert.equal( collection.search( 'foo' ).length, 0 );
		} );
	} );

	describe( 'searchNodes as object', () => {
		test( 'should find node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [
				'title',
				'author',
				{ urls: [ 'public', 'private' ] },
				{ editor: [ 'primary' ] },
			] );
			collection = new Collection();
			assert.equal( collection.search( 'test.com' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		test( 'should not find a node', () => {
			var Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [
				'title',
				'author',
				{ urls: [ 'public', 'private' ] },
				{ editor: [ 'primary' ] },
			] );

			collection = new Collection();
			assert.equal( collection.search( 'Kyle' ).length, 0 );
		} );
	} );
} );
