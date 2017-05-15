/**
 * External dependencies
 */
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_STATS,
} from '../../action-types';
import {
	generateStats,
	receiveStats,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const stats = {
		data: {
			generated: 1493997829,
			supercache: {
				cached: 1,
				cached_list: [ {
					lower_age: 180347,
					files: 2,
					upper_age: 183839,
					dir: 'wordpress.com/test'
				} ],
				expired: 0,
				expired_list: [],
				fsize: 59573,
			},
			wpcache: {
				cached: 0,
				cached_list: [],
				expired: 1,
				expired_list: [ {
					lower_age: 180347,
					files: 2,
					upper_age: 183839,
					dir: 'wordpress.com/test'
				} ],
				fsize: 59573,
			}
		}
	};

	describe( '#receiveStats()', () => {
		it( 'should return an action object', () => {
			const action = receiveStats( siteId, stats.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_STATS,
				stats: stats.data,
				siteId,
			} );
		} );
	} );

	describe( '#generateStats()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/stats' } )
				.reply( 200, stats )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/stats' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			generateStats( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return generateStats( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveStats( siteId, stats.data )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return generateStats( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return generateStats( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );
} );
