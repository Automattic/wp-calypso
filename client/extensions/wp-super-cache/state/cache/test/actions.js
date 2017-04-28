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
	WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
	WP_SUPER_CACHE_TEST_CACHE,
	WP_SUPER_CACHE_TEST_CACHE_FAILURE,
	WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
} from '../../action-types';
import {
	receiveResults,
	testCache,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const results = {
		data: {
			attempts: {
				first: {
					status: 'OK',
				}
			}
		}
	};

	describe( '#receiveResults()', () => {
		it( 'should return an action object', () => {
			const action = receiveResults( siteId, results.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_TEST_CACHE_RESULTS,
				results: results.data,
				siteId,
			} );
		} );
	} );

	describe( '#testCache()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache/test' } )
				.reply( 200, results )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/cache/test' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch test cache action when thunk triggered', () => {
			testCache( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_TEST_CACHE,
				siteId,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return testCache( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveResults( siteId, results.data )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return testCache( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TEST_CACHE_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return testCache( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TEST_CACHE_FAILURE,
					siteId: failedSiteId,
				} );
			} );
		} );
	} );
} );
