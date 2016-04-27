/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_STATS_RECEIVE,
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_FAILURE,
	POST_STATS_REQUEST_SUCCESS
} from 'state/action-types';
import {
	receivePostStat,
	requestPostStat
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#receivePostStat()', () => {
		it( 'should return an action object', () => {
			const action = receivePostStat( 'views', 2916284, 2454, 2 );

			expect( action ).to.eql( {
				type: POST_STATS_RECEIVE,
				stat: 'views',
				siteId: 2916284,
				postId: 2454,
				value: 2
			} );
		} );
	} );

	describe( '#requestPostStat()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/stats/post/2454?fields=views' )
				.reply( 200, { views: 2 } )
				.get( '/rest/v1.1/sites/2916285/stats/post/2455?fields=views' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPostStat( 'views', 2916284, 2454 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: POST_STATS_REQUEST,
				stat: 'views',
				siteId: 2916284,
				postId: 2454
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPostStat( 'views', 2916284, 2454 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePostStat( 'views', 2916284, 2454, 2 )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPostStat( 'views', 2916284, 2454 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_SUCCESS,
					stat: 'views',
					siteId: 2916284,
					postId: 2454
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPostStat( 'views', 2916285, 2455 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: POST_STATS_REQUEST_FAILURE,
					stat: 'views',
					siteId: 2916285,
					postId: 2455,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
