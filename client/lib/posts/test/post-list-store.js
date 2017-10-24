/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { isPlainObject, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { getRemovedPosts } from 'lib/posts/post-list-store';
import postListStoreFactory from 'lib/posts/post-list-store-factory';

jest.mock( 'lib/wp', () => require( './mocks/lib/wp' ) );

/**
 * Mock Data
 */
const TWO_POST_PAYLOAD = {
	found: 2,
	posts: [
		{
			global_ID: 778,
		},
		{
			global_ID: 779,
		},
	],
};
const THREE_POST_PAYLOAD = {
	found: 2,
	posts: [
		{
			global_ID: 778,
		},
		{
			global_ID: 779,
		},
		{
			global_ID: 780,
		},
	],
};
const OMITTED_POST_PAYLOAD = {
	found: 2,
	posts: [
		{
			global_ID: 778,
		},
		{
			global_ID: 780,
		},
	],
};
const THREE_POST_PAYLOAD_LOCAL = {
	__sync: {
		requestKey: 'UNIQUE_KEY',
		responseSource: 'local',
	},
	found: 2,
	posts: [
		{
			global_ID: 778,
		},
		{
			global_ID: 779,
		},
		{
			global_ID: 780,
		},
	],
};
const OMIT_INITIAL_POST_PAYLOAD_SERVER = {
	__sync: {
		requestKey: 'UNIQUE_KEY',
		responseSource: 'server',
	},
	found: 2,
	posts: [
		{
			global_ID: 779,
		},
		{
			global_ID: 780,
		},
	],
};
const DEFAULT_POST_LIST_ID = 'default';

function dispatchReceivePostsPage( id, postListStoreId, data ) {
	const mockData = {
		found: 1,
		posts: [
			{
				global_ID: 777,
			},
		],
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
		postListStoreId: postListStoreId,
	} );
}

describe( 'post-list-store', () => {
	let defaultPostListStore;

	beforeEach( () => {
		postListStoreFactory._reset();
		const postListCacheStore = require( 'lib/posts/post-list-cache-store' ).default;
		postListCacheStore._reset();
		defaultPostListStore = postListStoreFactory( DEFAULT_POST_LIST_ID );
	} );

	afterEach( () => {
		if ( defaultPostListStore.dispatchToken ) {
			Dispatcher.unregister( defaultPostListStore.dispatchToken );
		}
	} );

	describe( 'postListStoreId', () => {
		test( 'should set the default postListStoreId', () => {
			expect( defaultPostListStore.id ).toEqual( DEFAULT_POST_LIST_ID );
		} );
	} );

	describe( 'dispatcher', () => {
		test( 'should have a dispatch token', () => {
			expect( typeof defaultPostListStore.dispatchToken ).toBe( 'string' );
		} );
	} );

	describe( '#get', () => {
		test( 'should return an object', () => {
			expect( isPlainObject( defaultPostListStore.get() ) ).toBe( true );
		} );

		test( 'should return the correct default values', () => {
			const postList = defaultPostListStore.get();
			expect( isArray( postList.postIds ) ).toBe( true );
			expect( postList.postIds.length ).toEqual( 0 );
			expect( isArray( postList.errors ) ).toBe( true );
			expect( isPlainObject( postList.query ) ).toBe( true );
			expect( postList.errors.length ).toEqual( 0 );
			expect( postList.page ).toEqual( 0 );
			expect( postList.nextPageHandle ).toBe( false );
			expect( postList.isLastPage ).toBe( false );
			expect( postList.isFetchingNextPage ).toBe( false );
			expect( postList.isFetchingUpdated ).toBe( false );
		} );
	} );

	describe( '#getId', () => {
		test( 'should the return list ID', () => {
			expect( defaultPostListStore.getID() ).toEqual( defaultPostListStore.get().id );
		} );

		// fairly certain this doesn't actually work. Thes store ID is not part of the cache key...
		test( 'should globally increment ids across all stores', () => {
			const anotherPostListStore = postListStoreFactory( 'post-lists-nom' );
			dispatchQueryPosts( defaultPostListStore.id, {
				type: 'page',
				order: 'ASC',
			} );
			dispatchQueryPosts( anotherPostListStore.id, {
				type: 'page',
				order: 'ASC',
			} );
			expect( defaultPostListStore.getID() ).toEqual( anotherPostListStore.getID() );
		} );
	} );

	describe( '#getSiteId', () => {
		test( 'should the return site ID', () => {
			expect( defaultPostListStore.getSiteId() ).toEqual( defaultPostListStore.get().query.siteId );
		} );
	} );

	describe( '#getAll', () => {
		test( 'should return an array of posts', () => {
			const allPosts = defaultPostListStore.getAll();
			expect( isArray( allPosts ) ).toBe( true );
			expect( allPosts.length ).toEqual( 0 );
		} );
	} );

	describe( '#getTree', () => {
		test( 'should return a tree-ified array of posts', () => {
			const treePosts = defaultPostListStore.getTree();
			expect( isArray( treePosts ) ).toBe( true );
			expect( treePosts.length ).toEqual( 0 );
		} );
	} );

	describe( '#getPage', () => {
		test( 'should return the page number', () => {
			expect( defaultPostListStore.getPage() ).toEqual( defaultPostListStore.get().page );
		} );
	} );

	describe( '#isLastPage', () => {
		test( 'should return isLastPage boolean', () => {
			expect( defaultPostListStore.isLastPage() ).toEqual( defaultPostListStore.get().isLastPage );
		} );
	} );

	describe( '#isFetchingNextPage', () => {
		test( 'should return isFetchingNextPage boolean', () => {
			expect( defaultPostListStore.isFetchingNextPage() ).toEqual(
				defaultPostListStore.get().isFetchingNextPage
			);
		} );
	} );

	describe( '#getNextPageParams', () => {
		test( 'should return an object of params', () => {
			expect( isPlainObject( defaultPostListStore.getNextPageParams() ) ).toBe( true );
		} );
	} );

	describe( '#getRemovedPosts', () => {
		test( 'should remove ommitted posts from overlapping post-list response', () => {
			const storedList = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
			const freshList = [ 3, 5, 7, 9 ];
			const expectedResults = [ 4, 6, 8 ];
			expect( getRemovedPosts( storedList, freshList ) ).toEqual( expectedResults );
		} );
	} );

	describe( '#getUpdatesParams', () => {
		test( 'should return an object of params', () => {
			expect( isPlainObject( defaultPostListStore.getUpdatesParams() ) ).toBe( true );
		} );
	} );

	describe( '#hasRecentError', () => {
		test( 'should return false if there are no errors', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.hasRecentError() ).toBe( false );
		} );

		test( 'should return true if recent payload had error', () => {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_POSTS_PAGE',
				id: defaultPostListStore.getID(),
				postListStoreId: defaultPostListStore.id,
				data: null,
				error: {
					omg: 'error!',
				},
			} );
			expect( defaultPostListStore.hasRecentError() ).toBe( true );
		} );
	} );

	describe( 'RECEIVE_POSTS_PAGE', () => {
		test( 'should add post ids for matching postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
		} );

		test( 'should add additional post ids for matching postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
			dispatchReceivePostsPage(
				defaultPostListStore.getID(),
				defaultPostListStore.id,
				TWO_POST_PAYLOAD
			);
			expect( defaultPostListStore.getAll().length ).toEqual( 3 );
		} );

		test( 'should remove posts omitted in a follow-up post-list page', () => {
			dispatchReceivePostsPage(
				defaultPostListStore.getID(),
				defaultPostListStore.id,
				THREE_POST_PAYLOAD
			);
			expect( defaultPostListStore.getAll().length ).toEqual( 3 );
			dispatchReceivePostsPage(
				defaultPostListStore.getID(),
				defaultPostListStore.id,
				OMITTED_POST_PAYLOAD
			);
			expect( defaultPostListStore.getAll().length ).toEqual( 2 );
		} );

		test( 'should remove posts omitted in a follow-up server response', () => {
			dispatchReceivePostsPage(
				defaultPostListStore.getID(),
				defaultPostListStore.id,
				THREE_POST_PAYLOAD_LOCAL
			);
			expect( defaultPostListStore.getAll().length ).toEqual( 3 );
			dispatchReceivePostsPage(
				defaultPostListStore.getID(),
				defaultPostListStore.id,
				OMIT_INITIAL_POST_PAYLOAD_SERVER
			);
			expect( defaultPostListStore.getAll().length ).toEqual( 2 );
		} );

		test( 'should add only unique post.global_IDs postListStore', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
		} );

		test( 'should not update if cached store id does not match', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
			dispatchReceivePostsPage( 999, defaultPostListStore.id );
			expect( defaultPostListStore.getAll().length ).toEqual( 1 );
		} );

		test( 'should not add post ids if postListStore does not match', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), 'some-other-post-list-store' );
			expect( defaultPostListStore.getAll().length ).toEqual( 0 );
		} );

		test( 'should set isLastPage true if no next page handle returned', () => {
			dispatchReceivePostsPage( defaultPostListStore.getID(), defaultPostListStore.id );
			expect( defaultPostListStore.isLastPage() ).toBe( true );
		} );
	} );

	describe( 'QUERY_POSTS', () => {
		test( 'should not change cached list if query does not change', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			dispatchReceivePostsPage( DEFAULT_POST_LIST_ID );
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			expect( currentCacheId ).toEqual( defaultPostListStore.getID() );
		} );

		test( 'should change the active query and id when query options change', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			expect( currentCacheId ).not.toEqual( defaultPostListStore.getID() );
		} );

		test( 'should set site_visibility if no siteId is present', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			expect( defaultPostListStore.getNextPageParams().site_visibility ).toEqual( 'visible' );
		} );

		test( 'should set query options passed in', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC',
			} );
			const params = defaultPostListStore.getNextPageParams();
			expect( params.type ).toEqual( 'page' );
			expect( params.order ).toEqual( 'ASC' );
		} );

		test( 'should remove null query options passed in', () => {
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {
				type: 'page',
				order: 'ASC',
				search: null,
			} );
			const params = defaultPostListStore.getNextPageParams();
			expect( params.search ).not.toBeDefined();
		} );

		test( 'should not set query options on a different postListStore instance', () => {
			dispatchQueryPosts( 'some-other-post-list-store', { type: 'page' } );
			const params = defaultPostListStore.getNextPageParams();
			expect( params.type ).toEqual( 'post' );
			expect( params.order ).toEqual( 'DESC' );
		} );
	} );
} );
