/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	TOP_POSTS_RECEIVE,
	TOP_POSTS_REQUEST,
	TOP_POSTS_REQUEST_FAILURE,
	TOP_POSTS_REQUEST_SUCCESS,
} from 'state/action-types';
import { receiveTopPosts, requestTopPosts } from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveTopPosts()', () => {
		it( 'should return an action object', () => {
			const action = receiveTopPosts( 2916284, '2017-06-25', 'week', 1, {
				'2017-06-25': {
					postviews: [],
					total_views: 12,
				},
			} );

			expect( action ).to.eql( {
				type: TOP_POSTS_RECEIVE,
				siteId: 2916284,
				date: '2017-06-25',
				period: 'week',
				num: 1,
				postsByDay: {
					'2017-06-25': {
						postviews: [],
						total_views: 12,
					},
				},
			} );
		} );
	} );

	describe( '#requestTopPosts()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/stats/top-posts?date=2017-06-25&period=week&num=1' )
				.reply( 200, {
					date: '2017-06-25',
					days: {
						'2017-06-25': {
							postviews: [],
							total_views: '12',
						},
					},
					period: 'week',
				} )
				.get( '/rest/v1.1/sites/2916285/stats/top-posts?date=2017-06-25&period=week&num=1' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestTopPosts( 2916284, '2017-06-25', 'week', 1 )( spy );
			expect( spy ).to.have.been.calledWith( {
				type: TOP_POSTS_REQUEST,
				siteId: 2916284,
				period: 'week',
				date: '2017-06-25',
				num: 1,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestTopPosts( 2916284, '2017-06-25', 'week', 1 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveTopPosts( 2916284, '2017-06-25', 'week', 1, {
						'2017-06-25': {
							postviews: [],
							total_views: 12,
						},
					} ),
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestTopPosts( 2916284, '2017-06-25', 'week', 1 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TOP_POSTS_REQUEST_SUCCESS,
					siteId: 2916284,
					date: '2017-06-25',
					period: 'week',
					num: 1,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestTopPosts( 2916285, '2017-06-25', 'week', 1 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: TOP_POSTS_REQUEST_FAILURE,
					siteId: 2916285,
					date: '2017-06-25',
					period: 'week',
					num: 1,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
