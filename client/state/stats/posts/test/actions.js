/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receivePostStats, requestPostStats } from '../actions';
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#receivePostStat()', () => {
		test( 'should return an action object', () => {
			const action = receivePostStats( 2916284, 2454, { views: 2 } );

			expect( action ).to.eql( {
				type: POST_STATS_RECEIVE,
				siteId: 2916284,
				postId: 2454,
				stats: { views: 2 },
			} );
		} );
	} );

	describe( '#requestPostStat()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/stats/post/2454?fields=views%2Cyears' )
				.reply( 200, { views: 2, years: {} } )
				.get( '/rest/v1.1/sites/2916285/stats/post/2455?fields=views' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestPostStats( 2916284, 2454, [ 'views', 'years' ] )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_STATS_REQUEST,
				siteId: 2916284,
				postId: 2454,
				fields: [ 'views', 'years' ],
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestPostStats( 2916284, 2454, [ 'views', 'years' ] )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePostStats( 2916284, 2454, { views: 2, years: {} } )
				);
			} );
		} );

		test( 'should dispatch request success action when request completes', () => {
			return requestPostStats( 2916284, 2454, [ 'views', 'years' ] )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_SUCCESS,
					siteId: 2916284,
					postId: 2454,
					fields: [ 'views', 'years' ],
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestPostStats( 2916285, 2455, [ 'views' ] )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_FAILURE,
					siteId: 2916285,
					postId: 2455,
					fields: [ 'views' ],
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
