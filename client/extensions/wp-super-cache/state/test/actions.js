/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
} from '../action-types';
import {
	receiveSettings,
	requestSettings,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const settings = {
		data: {
			is_cache_enabled: true,
			is_super_cache_enabled: true,
		}
	};

	describe( '#receiveSettings()', () => {
		it( 'should return an action object', () => {
			const action = receiveSettings( siteId, settings.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				data: settings.data,
				siteId,
			} );
		} );
	} );

	describe( '#requestSettings()', () => {
		const failedSiteId = 456789;

		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/settings' } )
				.reply( 200, settings )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/settings' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSettings( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receiveSettings( siteId, settings.data )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestSettings( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestSettings( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
					siteId: failedSiteId,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
