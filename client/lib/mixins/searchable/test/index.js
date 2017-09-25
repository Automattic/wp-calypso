/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import Searchable from '../';

const makeCollection = function() {
	const Collection = function() {
		this.items = [
			{
				title: 'this title',
				author: 'bob ralian',
				urls: {
					'public': 'wordpress.com',
					'private': 'notwordpress.com'
				},
				editor: {
					primary: 'Susan',
					secondary: 'Kyle'
				}
			},
			{
				title: 'another title',
				author: 'Jill',
				urls: {
					'public': 'test.com',
					'private': 'blah.com'
				},
				editor: {
					primary: 'Edith',
					secondary: 'Susan'
				}
			}
		];
	};

	Collection.prototype.get = function() {
		return this.items;
	};

	return Collection;
};

describe( 'index', function() {
	describe( 'searchNodes as array', function() {
		it( 'should find node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title', 'author' ] );
			collection = new Collection();
			assert.equal( collection.search( 'Jill' ).length, 1 );
			assert.equal( collection.search( 'another' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		it( 'should not find a node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title', 'author' ] );
			collection = new Collection();
			assert.equal( collection.search( 'foo' ).length, 0 );
		} );
	} );

	describe( 'searchNodes as string', function() {
		it( 'should find node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, 'title' );
			collection = new Collection();
			assert.equal( collection.search( 'another' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		it( 'should not find a node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, 'title' );
			collection = new Collection();
			assert.equal( collection.search( 'foo' ).length, 0 );
		} );
	} );

	describe( 'searchNodes as object', function() {
		it( 'should find node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title',
				'author',
				{ urls: [ 'public', 'private' ] },
				{ editor: [ 'primary' ] }
			] );
			collection = new Collection();
			assert.equal( collection.search( 'test.com' ).length, 1 );
			assert.equal( collection.search( 'title' ).length, 2 );
		} );

		it( 'should not find a node', function() {
			let Collection = makeCollection(),
				collection;
			Searchable( Collection.prototype, [ 'title',
				'author',
				{ urls: [ 'public', 'private' ] },
				{ editor: [ 'primary' ] }
			] );

			collection = new Collection();
			assert.equal( collection.search( 'Kyle' ).length, 0 );
		} );
	} );
} );
