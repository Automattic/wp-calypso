/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_RECEIVE_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
} from '../../action-types';
import { receiveStatus, requestStatus } from '../actions';
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => ( spy = sandbox.spy() ) );

	const siteId = 123456;
	const failedSiteId = 456789;
	const status = {
		data: {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			},
		},
	};

	describe( '#receiveStatus()', () => {
		test( 'should return an action object', () => {
			const action = receiveStatus( siteId, status.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_STATUS,
				status: status.data,
				siteId,
			} );
		} );
	} );

	describe( '#requestStatus()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/status' } )
				.reply( 200, status )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/status' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.',
				} );
		} );

		test( 'should dispatch request action when thunk triggered', () => {
			requestStatus( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_STATUS,
				siteId,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			return requestStatus( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( receiveStatus( siteId, status.data ) );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestStatus( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
				} );
			} );
		} );
	} );
} );
