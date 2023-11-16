import {
	POST_COUNTS_RECEIVE,
	POST_COUNTS_REQUEST,
	POST_COUNTS_REQUEST_SUCCESS,
	POST_COUNTS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { receivePostCounts, requestPostCounts } from '../actions';

describe( 'actions', () => {
	let spy;

	beforeEach( () => {
		spy = jest.fn();
	} );

	describe( '#receivePostCounts()', () => {
		test( 'should return an action object', () => {
			const counts = {
				all: { publish: 2 },
				mine: { publish: 1 },
			};
			const action = receivePostCounts( 2916284, 'post', counts );

			expect( action ).toEqual( {
				type: POST_COUNTS_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				counts,
			} );
		} );
	} );

	describe( '#requestPostCounts()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/wpcom/v2/sites/2916284/post-counts/post' )
				.reply( 200, {
					counts: {
						all: { publish: 2 },
						mine: { publish: 1 },
					},
				} )
				.get( '/wpcom/v2/sites/2916284/post-counts/foo' )
				.reply( 404, {
					code: 'unknown_post_type',
					message: 'Unknown post type requested',
				} );
		} );

		test( 'should dispatch request action when thunk triggered', () => {
			requestPostCounts( 2916284, 'post' )( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: POST_COUNTS_REQUEST,
				siteId: 2916284,
				postType: 'post',
			} );
		} );

		test( 'should dispatch receive action when request succeeds', () => {
			return requestPostCounts(
				2916284,
				'post'
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: POST_COUNTS_RECEIVE,
					siteId: 2916284,
					postType: 'post',
					counts: {
						all: { publish: 2 },
						mine: { publish: 1 },
					},
				} );
			} );
		} );

		test( 'should dispatch success action when request succeeds', () => {
			return requestPostCounts(
				2916284,
				'post'
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: POST_COUNTS_REQUEST_SUCCESS,
					siteId: 2916284,
					postType: 'post',
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestPostCounts(
				2916284,
				'foo'
			)( spy ).then( () => {
				expect( spy ).toHaveBeenCalledWith( {
					type: POST_COUNTS_REQUEST_FAILURE,
					siteId: 2916284,
					postType: 'foo',
					error: expect.objectContaining( { code: 'unknown_post_type' } ),
				} );
			} );
		} );
	} );
} );
