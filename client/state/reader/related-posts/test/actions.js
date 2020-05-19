/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestRelatedPosts } from '../actions';
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE,
} from 'state/reader/action-types';
import useNock from 'test/helpers/use-nock';
jest.mock( 'state/reader/posts/actions', () => ( {
	receivePosts( posts ) {
		return Promise.resolve( posts );
	},
} ) );

describe( 'actions', () => {
	describe( 'success', () => {
		useNock( ( nock ) => {
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
		} );

		let fakeDispatch;
		let requestPromise;
		beforeAll( () => {
			fakeDispatch = sinon.stub();
			fakeDispatch.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			requestPromise = requestRelatedPosts( 1, 1 )( fakeDispatch );
		} );

		test( 'should have dispatched request', () => {
			expect( fakeDispatch ).to.have.been.calledWith( {
				type: READER_RELATED_POSTS_REQUEST,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
				},
			} );
		} );

		test( 'should return a promise which has dispatched related posts', () => {
			return requestPromise.then( () => {
				expect( fakeDispatch ).to.have.been.calledWith( {
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
		} );

		test( 'should return a promise which has dispatched success', () => {
			return requestPromise.then( () => {
				expect( fakeDispatch ).to.have.been.calledWith( {
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: {
						siteId: 1,
						postId: 1,
						scope: 'all',
					},
				} );
			} );
		} );
	} );

	describe( 'failure', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/site/1/post/1/related?meta=site' )
				.reply( 400, {} );
		} );

		let fakeDispatch;
		let requestPromise;
		beforeAll( () => {
			fakeDispatch = sinon.spy();
			requestPromise = requestRelatedPosts( 1, 1 )( fakeDispatch );
		} );

		test( 'should have dispatched request', () => {
			expect( fakeDispatch ).to.have.been.calledWith( {
				type: READER_RELATED_POSTS_REQUEST,
				payload: {
					siteId: 1,
					postId: 1,
					scope: 'all',
				},
			} );
		} );

		test( 'should have dispatched receive with an empty array', () => {
			return requestPromise.catch( () => {
				expect( fakeDispatch ).to.have.been.calledWith( {
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId: 1,
						postId: 1,
						scope: 'all',
						posts: [],
					},
				} );
			} );
		} );

		test( 'should fail the promise and dispatch failure', () => {
			return requestPromise.catch( () => {
				expect( fakeDispatch ).to.have.been.calledWith( {
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: {
						siteId: 1,
						postId: 1,
						scope: 'all',
						error: sinon.match.instanceOf( Error ),
					},
					error: true,
				} );
			} );
		} );
	} );
} );
