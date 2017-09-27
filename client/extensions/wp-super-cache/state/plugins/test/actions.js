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
	WP_SUPER_CACHE_RECEIVE_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
	WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
	WP_SUPER_CACHE_TOGGLE_PLUGIN,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
} from '../../action-types';
import {
	receivePlugins,
	requestPlugins,
	togglePlugin,
} from '../actions';

describe( 'actions', () => {
	let spy;

	useSandbox( ( sandbox ) => spy = sandbox.spy() );

	const siteId = 123456;
	const failedSiteId = 456789;
	const plugins = {
		data: {
			is_cache_enabled: true,
			is_super_cache_enabled: true,
		}
	};

	describe( '#receivePlugins()', () => {
		it( 'should return an action object', () => {
			const action = receivePlugins( siteId, plugins.data );

			expect( action ).to.eql( {
				type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
				plugins: plugins.data,
				siteId,
			} );
		} );
	} );

	describe( '#requestPlugins()', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/plugins' } )
				.reply( 200, plugins )
				.get( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/plugins' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestPlugins( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_REQUEST_PLUGINS,
				siteId,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return requestPlugins( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePlugins( siteId, plugins.data )
				);
			} );
		} );

		it( 'should dispatch request success action when request completes', () => {
			return requestPlugins( siteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestPlugins( failedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
					siteId: failedSiteId,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );

	describe( 'togglePlugin()', () => {
		const plugin = 'no_adverts_for_friends';
		const apiResponse = {
			data: {
				updated: true,
			}
		};

		useNock( nock => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.post( `/rest/v1.1/jetpack-blogs/${ siteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/plugins' } )
				.reply( 200, apiResponse )
				.post( `/rest/v1.1/jetpack-blogs/${ failedSiteId }/rest-api/` )
				.query( { path: '/wp-super-cache/v1/plugins' } )
				.reply( 403, {
					error: 'authorization_required',
					message: 'User cannot access this private blog.'
				} );
		} );

		it( 'should dispatch toggle action when thunk triggered', () => {
			togglePlugin( siteId, plugin )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: WP_SUPER_CACHE_TOGGLE_PLUGIN,
				siteId,
				plugin,
			} );
		} );

		it( 'should dispatch receive action when request completes', () => {
			return togglePlugin( siteId, plugin )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith(
					receivePlugins( siteId, apiResponse.data )
				);
			} );
		} );

		it( 'should dispatch save success action when request completes', () => {
			return togglePlugin( siteId, plugin )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
					plugin,
					siteId,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return togglePlugin( failedSiteId, plugin )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
					siteId: failedSiteId,
					plugin,
					error: sinon.match( { message: 'User cannot access this private blog.' } ),
				} );
			} );
		} );
	} );
} );
