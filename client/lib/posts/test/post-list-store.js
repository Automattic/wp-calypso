/**
 * External dependencies
 */
import rewire from 'rewire';
import { assert } from 'chai';
import Dispatcher from 'dispatcher';
import isPlainObject from 'lodash/lang/isPlainObject';
import isArray from 'lodash/lang/isArray';

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

describe( 'post-list-store', () => {
	let postListStoreFactory;
	let defaultPostListStore;
	before( () => {
		postListStoreFactory = rewire( '../post-list-store-factory' );
	} );

	beforeEach( () => {
		postListStoreFactory.__set__( '_postListStores', {} );
		defaultPostListStore = postListStoreFactory();
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

		it( 'should globally increment ids across all stores', () => {
			const anotherPostListStore = postListStoreFactory( 'post-lists-nom' );
			dispatchQueryPosts( defaultPostListStore.id, {
				type: 'page',
				order: 'ASC'
			} );
			dispatchQueryPosts( anotherPostListStore.id, {
				type: 'page',
				order: 'ASC'
			} );
			assert.equal( defaultPostListStore.getID() + 1, anotherPostListStore.getID() );
		} );
	} );

	describe( '#getSiteID', () => {
		it( 'should the return site ID', () => {
			assert.equal( defaultPostListStore.getSiteID(), defaultPostListStore.get().query.siteID );
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
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, {} );
			assert.equal( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should change the active query and id when query options change', () => {
			const currentCacheId = defaultPostListStore.getID();
			dispatchQueryPosts( DEFAULT_POST_LIST_ID, { type: 'page' } );
			assert.notEqual( currentCacheId, defaultPostListStore.getID() );
		} );

		it( 'should set site_visibility if no siteID is present', () => {
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
