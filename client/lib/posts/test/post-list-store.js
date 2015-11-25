/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var rewire = require( 'rewire' ),
	assert = require( 'chai' ).assert,
	includes = require( 'lodash/collection/includes' ),
	Dispatcher = require( 'dispatcher' );

describe( 'post-list-store', function() {
	var PostListStoreFactory, defaultPostListStore;
	before( function() {
		PostListStoreFactory = rewire( '../post-list-store-factory' );
	} );

	beforeEach( function() {
		PostListStoreFactory.__set__( '_postListStores', {} );
		defaultPostListStore = PostListStoreFactory();
	} );

	afterEach( function() {
		if ( defaultPostListStore.dispatchToken ) {
			Dispatcher.unregister( defaultPostListStore.dispatchToken );
		}
	} );

	describe( 'postListStoreId', function() {
		it( 'should set the default postListStoreId', function() {
			assert.equal( defaultPostListStore.id, 'default' );
		} );
	} );

	describe( 'dispatcher', function() {
		it( 'should have a dispatch token', function() {
			assert.typeOf( defaultPostListStore.dispatchToken, 'string' );
		} );
	} );

	describe( '#get', function() {
		it( 'should return an object', function() {
			assert.instanceOf( defaultPostListStore.get(), Object );
		} );

		it( 'should return the correct default values', function(){
			var postList = defaultPostListStore.get();
			assert.instanceOf( postList.postIds, Array );
			assert.equal( postList.postIds.length, 0 );
			assert.instanceOf( postList.errors, Array );
			assert.instanceOf( postList.query, Object );
			assert.equal( postList.errors.length, 0 );
			assert.equal( postList.page, 0 );
			assert.isFalse( postList.nextPageHandle );
			assert.isFalse( postList.isLastPage );
			assert.isFalse( postList.isFetchingNextPage );
			assert.isFalse( postList.isFetchingUpdated );
		} );
	} );

	describe( '#getId', function() {
		it( 'should the return list ID', function() {
			assert.equal( defaultPostListStore.getID(), defaultPostListStore.get().id );
		} );
	} );

	describe( '#getSiteID', function() {
		it( 'should the return site ID', function() {
			assert.equal( defaultPostListStore.getSiteID(), defaultPostListStore.get().query.siteID );
		} );
	} );

	describe( '#getAll', function() {
		it( 'should return an array of posts', function() {
			var allPosts = defaultPostListStore.getAll();
			assert.instanceOf( allPosts, Array );
			assert.equal( allPosts.length, 0 );
		} );
	} );

	describe( '#getTree', function() {
		it( 'should return a tree-ified array of posts', function() {
			var treePosts = defaultPostListStore.getTree();
			assert.instanceOf( treePosts, Array );
			assert.equal( treePosts.length, 0 );
		} );
	} );

	describe( '#getPage', function() {
		it( 'should return the page number', function() {
			assert.equal( defaultPostListStore.getPage(), defaultPostListStore.get().page );
		} );
	} );

	describe( '#isLastPage', function() {
		it( 'should return isLastPage boolean', function() {
			assert.equal( defaultPostListStore.isLastPage(), defaultPostListStore.get().isLastPage );
		} );
	} );

	describe( '#isFetchingNextPage', function() {
		it( 'should return isFetchingNextPage boolean', function() {
			assert.equal( defaultPostListStore.isFetchingNextPage(), defaultPostListStore.get().isFetchingNextPage );
		} );
	} );

	describe( '#getNextPageParams', function() {
		it( 'should return an object of params', function() {
			assert.instanceOf( defaultPostListStore.getNextPageParams(), Object );
		} );
	} );

	describe( '#getUpdatesParams', function() {
		it( 'should return an object of params', function() {
			assert.instanceOf( defaultPostListStore.getUpdatesParams(), Object );
		} );
	} );
} );
