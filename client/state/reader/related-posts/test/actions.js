/**
 * External dependencies
 */
import nock from 'nock';

/**
 * Internal dependencies
 */
import { requestRelatedPosts } from '../actions';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
} from 'calypso/state/reader/action-types';

jest.mock( 'calypso/state/reader/posts/actions', () => ( {
	receivePosts( posts ) {
		return Promise.resolve( posts );
	},
} ) );

describe( 'actions', () => {
	describe( 'success', () => {
		let fakeDispatch;
		let requestPromise;

		beforeAll( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/site/1/post/1/related?meta=site' )
				.reply( 200, {
					posts: [
						{
							ID: 1,
							global_ID: 1,
							site_ID: 1,
						},
					],
				} );

			fakeDispatch = jest.fn( ( p ) => p );
			requestPromise = requestRelatedPosts( 1, 1 )( fakeDispatch );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should have dispatched request', () => {
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_REQUEST,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
				},
			} );
		} );

		test( 'should return a promise which has dispatched related posts', async () => {
			await requestPromise;
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_RECEIVE,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
					posts: [
						{
							ID: 1,
							global_ID: 1,
							site_ID: 1,
						},
					],
				},
			} );
		} );

		test( 'should return a promise which has dispatched success', async () => {
			await requestPromise;
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_REQUEST_SUCCESS,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
				},
			} );
		} );
	} );

	describe( 'failure', () => {
		let fakeDispatch;
		let requestPromise;

		beforeAll( async () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/site/1/post/1/related?meta=site' )
				.reply( 400, {} );

			fakeDispatch = jest.fn();
			requestPromise = requestRelatedPosts( 1, 1 )( fakeDispatch );
		} );

		afterAll( () => {
			nock.cleanAll();
		} );

		test( 'should have dispatched request', () => {
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_REQUEST,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
				},
			} );
		} );

		test( 'should have dispatched receive with an empty array', async () => {
			await requestPromise;
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_RECEIVE,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
					posts: [],
				},
			} );
		} );

		test( 'should fail the promise and dispatch failure', async () => {
			await requestPromise;
			expect( fakeDispatch ).toHaveBeenCalledWith( {
				type: READER_RELATED_POSTS_REQUEST_FAILURE,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
					error: expect.any( Error ),
				},
				error: true,
			} );
		} );
	} );
} );
