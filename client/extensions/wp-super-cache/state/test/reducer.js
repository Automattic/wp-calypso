/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
} from '../action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.requesting ).to.eql( {} );
		} );

		it( 'should set request to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate requesting values', () => {
			const previousState = deepFreeze( {
				requesting: {
					[ primarySiteId ]: true,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set request to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				requesting: {
					[ primarySiteId ]: true,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set request to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				requesting: {
					[ primarySiteId ]: true,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );
	} );

	describe( 'items()', () => {
		const primarySettings = { is_cache_enabled: true };
		const secondarySettings = { is_cache_enabled: false };

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		it( 'should index settings by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: primarySettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		it( 'should accumulate settings', () => {
			const previousState = deepFreeze( {
				items: {
					[ primarySiteId ]: primarySettings,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: secondarySiteId,
				settings: secondarySettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primarySettings,
				[ secondarySiteId ]: secondarySettings,
			} );
		} );

		it( 'should override previous settings of same site ID', () => {
			const previousState = deepFreeze( {
				items: {
					[ primarySiteId ]: primarySettings,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: secondarySettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondarySettings,
			} );
		} );

		it( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const newSettings = { is_cache_enabled: false, is_super_cache_enabled: true };
			const previousState = deepFreeze( {
				items: {
					[ primarySiteId ]: primarySettings,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: newSettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: { is_cache_enabled: false, is_super_cache_enabled: true },
			} );
		} );
	} );
} );
