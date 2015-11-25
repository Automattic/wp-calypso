/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var rewire = require( 'rewire' ),
	assert = require( 'chai' ).assert,
	Dispatcher = require( 'dispatcher' );

/**
 * Mock Data
 */
var TWO_POST_PAYLOAD = {
	found: 2,
	posts: [ {
		global_ID: 778
	}, {
		global_ID: 779
	} ]
};
var DEFAULT_POST_LIST_ID = 'default';

function dispatchReceivePostsPage( id, postListStoreId, data ) {
	var mockData = {
			found: 1,
			posts: [ {
				global_ID: 777
			} ]
		};
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_POSTS_PAGE',
		id: id,
		postListStoreId: postListStoreId,
		data: data || mockData,
		error: null
	} );
}

function dispatchQueryPosts( postListStoreId, options ) {
	Dispatcher.handleViewAction( {
		type: 'QUERY_POSTS',
		options: options,
		postListStoreId: postListStoreId
	} );
}

describe( 'post-list-store', function() {
	var postListStoreFactory, defaultPostListStore;
	before( function() {
		postListStoreFactory = rewire( '../post-list-store-factory' );
	} );

	beforeEach( function() {
		postListStoreFactory.__set__( '_postListStores', {} );
		defaultPostListStore = postListStoreFactory();
	} );

	afterEach( function() {
		if ( defaultPostListStore.dispatchToken ) {
			Dispatcher.unregister( defaultPostListStore.dispatchToken );
		}
	} );

	describe( 'postListStoreId', function() {
		it( 'should set the default postListStoreId', function() {
			assert.equal( defaultPostListStore.id, DEFAULT_POST_LIST_ID );
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

		it( 'should return the correct default values', function() {
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

	describe( 'RECEIVE_POSTS_PAGE', function() {
		it( 'should add post ids for matching postListStore', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should add additional post ids for matching postListStore', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, TWO_POST_PAYLOAD );
			assert.equal( defaultPostListStore.getAll().length, 3 );
		} );

		it( 'should add only unique post.global_IDs postListStore', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should not update if cached store id does not match', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( 999, defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should not add post ids if postListStore does not match', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), 'some-other-post-list-store' );
			assert.equal( defaultPostListStore.getAll().length, 0 );
		} );

		it( 'should set isLastPage true if no next page handle returned', function() {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.isTrue( defaultPostListStore.isLastPage() );
		} );
	} );

	describe( 'QUERY_POSTS', function() {
		it( 'should not change cached list if query does not change', function() {
			var currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			assert.equal( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should change the active query and id when query options change', function() {
			var currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			assert.notEqual( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should set site_visibility if no siteID is present', function() {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			assert.equal( defaultPostListStore.getNextPageParams().site_visibility, 'visible' );
		} );

		it( 'should set query options passed in', function() {
			var params;
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC'
			} );
			params = defaultPostListStore.getNextPageParams();
			assert.equal( params.type, 'page' );
			assert.equal( params.order, 'ASC' );
		} );

		it( 'should remove null query options passed in', function() {
			var params;
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC',
				search: null
			} );
			params = defaultPostListStore.getNextPageParams();
			assert.isUndefined( params.search );
		} );

		it( 'should not set query options on a different postListStore instance', function() {
			var params;
			dispatchQueryPosts( 'some-other-post-list-store', { type: 'page' } );
			params = defaultPostListStore.getNextPageParams();
			assert.equal( params.type, 'post' );
			assert.equal( params.order, 'DESC' );
		} );
	} );
} );
