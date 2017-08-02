/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_DELETE_DEBUG_LOG,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
	WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
} from '../../action-types';
import {
	deleteDebugLog,
	requestDebugLogs,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const filename = '89fe3b92191d36ee7fb3956cd52c704c.php';
	const username = '145cc79483f018538a3edc78117622ba';
	const debugLogs = {
		[ filename ]: username
	};

	describe( '#requestDebugLogs()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/debug' } )
				.reply( 200, { data: debugLogs } )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/debug' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestDebugLogs( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS,
				siteId,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestDebugLogs( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_SUCCESS,
					siteId,
					data: debugLogs,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestDebugLogs( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_DEBUG_LOGS_FAILURE,
					siteId: failedSiteId,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( '#deleteDebugLog()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/debug', body: JSON.stringify( { filename } ), json: true } )
				.reply( 200, { wp_delete_debug_log: true } )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/debug', body: JSON.stringify( { filename } ), json: true } )
				.reply( 403 );
		} );

		it( 'should dispatch delete debug log action when thunk triggered', () => {
			deleteDebugLog( siteId, filename )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_DELETE_DEBUG_LOG,
				siteId,
				filename,
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return deleteDebugLog( siteId, filename )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_SUCCESS,
					siteId,
					filename,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return deleteDebugLog( failedSiteId, filename )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_DELETE_DEBUG_LOG_FAILURE,
					siteId: failedSiteId,
					filename,
				} );
			} );
		} );
	} );
} );
