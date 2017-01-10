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
	VIDEO_STATS_RECEIVE,
	VIDEO_STATS_REQUEST,
	VIDEO_STATS_REQUEST_FAILURE,
	VIDEO_STATS_REQUEST_SUCCESS
} from 'state/action-types';
import {
	receiveVideoStats,
	requestVideoStats
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( 'receiveVideoStat()', () => {
		it( 'should return an action object', () => {
			const action = receiveVideoStats( 2916284, 2454, [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ] );

			expect( action ).to.eql( {
				type: VIDEO_STATS_RECEIVE,
				siteId: 2916284,
				videoId: 2454,
				stats: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ]
			} );
		} );
	} );

	describe( 'requestVideoStat()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/sites/2916284/stats/video/2454' )
				.reply( 200, { data: [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ] } )
				.get( '/rest/v1.1/sites/2916285/stats/video/2455' )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestVideoStats( 2916284, 2454 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: VIDEO_STATS_REQUEST,
				siteId: 2916284,
				videoId: 2454,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestVideoStats( 2916284, 2454 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveVideoStats( 2916284, 2454, [ [ '2016-11-11', 1 ], [ '2016-11-12', 1 ] ] )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestVideoStats( 2916284, 2454 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: VIDEO_STATS_REQUEST_SUCCESS,
					siteId: 2916284,
					videoId: 2454,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestVideoStats( 2916285, 2455 )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: VIDEO_STATS_REQUEST_FAILURE,
					siteId: 2916285,
					videoId: 2455,
					error: sinon.match( { message: 'User cannot access this private blog.' } )
				} );
			} );
		} );
	} );
} );
