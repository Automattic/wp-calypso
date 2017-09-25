/**
 * External dependencies
 */
import { assert } from 'chai';
import { isPlainObject, isArray, noop } from 'lodash';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import postListCacheStore from 'lib/posts/post-list-cache-store';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

let Dispatcher;

/**
 * Mock Data
 */
const TWO_POST_PAYLOAD = {
	found: 2,
	posts: [ {
		global_ID: 778
	}, {
		global_ID: 779
	} ]
};
const THREE_POST_PAYLOAD = {
	found: 2,
	posts: [ {
		global_ID: 778
	}, {
		global_ID: 779
	}, {
		global_ID: 780
	} ]
};
const OMITTED_POST_PAYLOAD = {
	found: 2,
	posts: [ {
		global_ID: 778
	}, {
		global_ID: 780
	} ]
};
const THREE_POST_PAYLOAD_LOCAL = {
	__sync: {
		requestKey: 'UNIQUE_KEY',
		responseSource: 'local',
	},
	found: 2,
	posts: [ {
		global_ID: 778
	}, {
		global_ID: 779
	}, {
		global_ID: 780
	} ]
};
const OMIT_INITIAL_POST_PAYLOAD_SERVER = {
	__sync: {
		requestKey: 'UNIQUE_KEY',
		responseSource: 'server',
	},
	found: 2,
	posts: [ {
		global_ID: 779
	}, {
		global_ID: 780
	} ]
};
const DEFAULT_POST_LIST_ID = 'default';

function dispatchReceivePostsPage( id, postListStoreId, data ) {
	const mockData = {
		found: 1,
		posts: [ {
			global_ID: 777
		} ]
	};
	Dispatcher.handleServerAction( {
		type: 'RECEIVE_POSTS_PAGE',
		data: data || mockData,
		error: null,
		id,
		postListStoreId,
	} );
}

function dispatchQueryPosts( postListStoreId, options ) {
	Dispatcher.handleViewAction( {
		type: 'QUERY_POSTS',
		options,
		postListStoreId,
	} );
	// have to dispatch this to get it into cache
	Dispatcher.handleViewAction( {
		type: 'FETCH_NEXT_POSTS_PAGE',
		postListStoreId: postListStoreId
	} );
}

describe( 'post-list-store', () => {
	let defaultPostListStore, getRemovedPosts, postListStoreFactory;

	useFakeDom();
	useMockery();

	before( () => {
		mockery.registerMock( 'lib/wp', {
			me: () => ( {
				get: noop
			} )
		} );
		mockery.registerAllowable( 'lib/posts/post-list-store-factory' );
		mockery.registerAllowable( 'lib/posts/post-list-cache-store' );
		mockery.registerAllowable( 'lib/posts/post-list-store' );

		getRemovedPosts = require( 'lib/posts/post-list-store' ).getRemovedPosts;
		postListStoreFactory = require( 'lib/posts/post-list-store-factory' );
		Dispatcher = require( 'dispatcher' );
	} );

	beforeEach( () => {
	    postListStoreFactory._reset();
		postListCacheStore._reset();
		defaultPostListStore = postListStoreFactory( DEFAULT_POST_LIST_ID );
	} );

	afterEach( () => {
		if ( defaultPostListStore.dispatchToken ) {
			Dispatcher.unregister( defaultPostListStore.dispatchToken );
		}
	} );

	describe( 'postListStoreId', () => {
		it( 'should set the default postListStoreId', () => {
			assert.equal( defaultPostListStore.id, DEFAULT_POST_LIST_ID );
		} );
	} );

	describe( 'dispatcher', () => {
		it( 'should have a dispatch token', () => {
			assert.typeOf( defaultPostListStore.dispatchToken, 'string' );
		} );
	} );

	describe( '#get', () => {
		it( 'should return an object', () => {
			assert.isTrue( isPlainObject( defaultPostListStore.get() ) );
		} );

		it( 'should return the correct default values', () => {
			const postList = defaultPostListStore.get();
			assert.isTrue( isArray( postList.postIds ) );
			assert.equal( postList.postIds.length, 0 );
			assert.isTrue( isArray( postList.errors ) );
			assert.isTrue( isPlainObject( postList.query ) );
			assert.equal( postList.errors.length, 0 );
			assert.equal( postList.page, 0 );
			assert.isFalse( postList.nextPageHandle );
			assert.isFalse( postList.isLastPage );
			assert.isFalse( postList.isFetchingNextPage );
			assert.isFalse( postList.isFetchingUpdated );
		} );
	} );

	describe( '#getId', () => {
		it( 'should the return list ID', () => {
			assert.equal( defaultPostListStore.getID(), defaultPostListStore.get().id );
		} );

		// fairly certain this doesn't actually work. Thes store ID is not part of the cache key...
		it.skip( 'should globally increment ids across all stores', () => {
			const anotherPostListStore = postListStoreFactory( 'post-lists-nom' );
			dispatchQueryPosts( defaultPostListStore.id, {
				type: 'page',
				order: 'ASC'
			} );
			dispatchQueryPosts( anotherPostListStore.id, {
				type: 'page',
				order: 'ASC'
			} );
			assert.equal( defaultPostListStore.getID(), anotherPostListStore.getID() );
		} );
	} );

	describe( '#getSiteId', () => {
		it( 'should the return site ID', () => {
			assert.equal( defaultPostListStore.getSiteId(), defaultPostListStore.get().query.siteId );
		} );
	} );

	describe( '#getAll', () => {
		it( 'should return an array of posts', () => {
			const allPosts = defaultPostListStore.getAll();
			assert.isTrue( isArray( allPosts ) );
			assert.equal( allPosts.length, 0 );
		} );
	} );

	describe( '#getTree', () => {
		it( 'should return a tree-ified array of posts', () => {
			const treePosts = defaultPostListStore.getTree();
			assert.isTrue( isArray( treePosts ) );
			assert.equal( treePosts.length, 0 );
		} );
	} );

	describe( '#getPage', () => {
		it( 'should return the page number', () => {
			assert.equal( defaultPostListStore.getPage(), defaultPostListStore.get().page );
		} );
	} );

	describe( '#isLastPage', () => {
		it( 'should return isLastPage boolean', () => {
			assert.equal( defaultPostListStore.isLastPage(), defaultPostListStore.get().isLastPage );
		} );
	} );

	describe( '#isFetchingNextPage', () => {
		it( 'should return isFetchingNextPage boolean', () => {
			assert.equal( defaultPostListStore.isFetchingNextPage(), defaultPostListStore.get().isFetchingNextPage );
		} );
	} );

	describe( '#getNextPageParams', () => {
		it( 'should return an object of params', () => {
			assert.isTrue( isPlainObject( defaultPostListStore.getNextPageParams() ) );
		} );
	} );

	describe( '#getRemovedPosts', () => {
		it( 'should remove ommitted posts from overlapping post-list response', () => {
			const storedList = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
			const freshList = [ 3, 5, 7, 9 ];
			const expectedResults = [ 4, 6, 8 ];
			assert.deepEqual( getRemovedPosts( storedList, freshList ), expectedResults );
		} );
	} );

	describe( '#getUpdatesParams', () => {
		it( 'should return an object of params', () => {
			assert.isTrue( isPlainObject( defaultPostListStore.getUpdatesParams() ) );
		} );
	} );

	describe( '#hasRecentError', () => {
		it( 'should return false if there are no errors', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.isFalse( defaultPostListStore.hasRecentError() );
		} );

		it( 'should return true if recent payload had error', () => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POSTS_PAGE',
				id: defaultPostListStore.getID(),
				postListStoreId: defaultPostListStore.id,
				data: null,
				error: {
					omg: 'error!'
				}
			} );
			assert.isTrue( defaultPostListStore.hasRecentError() );
		} );
	} );

	describe( 'RECEIVE_POSTS_PAGE', () => {
		it( 'should add post ids for matching postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should add additional post ids for matching postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, TWO_POST_PAYLOAD );
			assert.equal( defaultPostListStore.getAll().length, 3 );
		} );

		it( 'should remove posts omitted in a follow-up post-list page', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, THREE_POST_PAYLOAD );
			assert.equal( defaultPostListStore.getAll().length, 3 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, OMITTED_POST_PAYLOAD );
			assert.equal( defaultPostListStore.getAll().length, 2 );
		} );

		it( 'should remove posts omitted in a follow-up server response', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, THREE_POST_PAYLOAD_LOCAL );
			assert.equal( defaultPostListStore.getAll().length, 3 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id, OMIT_INITIAL_POST_PAYLOAD_SERVER );
			assert.equal( defaultPostListStore.getAll().length, 2 );
		} );

		it( 'should add only unique post.global_IDs postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should not update if cached store id does not match', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
			dispatchReceivePostsPage( 999, defaultPostListStore.id );
			assert.equal( defaultPostListStore.getAll().length, 1 );
		} );

		it( 'should not add post ids if postListStore does not match', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), 'some-other-post-list-store' );
			assert.equal( defaultPostListStore.getAll().length, 0 );
		} );

		it( 'should set isLastPage true if no next page handle returned', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			assert.isTrue( defaultPostListStore.isLastPage() );
		} );
	} );

	describe( 'QUERY_POSTS', () => {
		it( 'should not change cached list if query does not change', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			dispatchReceivePostsPage( DEFAULT_POST_LIST_ID );
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			assert.equal( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should change the active query and id when query options change', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { } );
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			assert.notEqual( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should set site_visibility if no siteId is present', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			assert.equal( defaultPostListStore.getNextPageParams().site_visibility, 'visible' );
		} );

		it( 'should set query options passed in', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC'
			} );
			const params = defaultPostListStore.getNextPageParams();
			assert.equal( params.type, 'page' );
			assert.equal( params.order, 'ASC' );
		} );

		it( 'should remove null query options passed in', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC',
				search: null
			} );
			const params = defaultPostListStore.getNextPageParams();
			assert.isUndefined( params.search );
		} );

		it( 'should not set query options on a different postListStore instance', () => {
			dispatchQueryPosts( 'some-other-post-list-store', { type: 'page' } );
			const params = defaultPostListStore.getNextPageParams();
			assert.equal( params.type, 'post' );
			assert.equal( params.order, 'DESC' );
		} );
	} );
} );
