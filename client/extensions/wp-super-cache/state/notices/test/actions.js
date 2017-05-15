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
	WP_SUPER_CACHE_RECEIVE_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE,
} from '../../action-types';
import {
	receiveNotices,
	requestNotices,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const notices = {
		data: {
			cache_writable: {
				message: '/home/public_html/ is writable.',
				type: 'warning',
			}
		}
	};

	describe( '#receiveNotices()', () => {
		it( 'should return an action object', () => {
			const action = receiveNotices( siteId, notices.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_NOTICES,
				notices: notices.data,
				siteId,
			} );
		} );
	} );

	describe( '#requestNotices()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/notices' } )
				.reply( 200, notices )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/notices' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch request action when thunk triggered', () => {
			requestNotices( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_NOTICES,
				siteId,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestNotices( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveNotices( siteId, notices.data )
				);
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestNotices( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE,
				} );
			} );
		} );
	} );
} );
