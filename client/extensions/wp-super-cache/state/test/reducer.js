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

	describe( 'settings()', () => {
		const primaryData = { is_cache_enabled: true };
		const secondaryData = { is_cache_enabled: false };

		it( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.settings ).to.eql( {} );
		} );

		it( 'should index settings by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				data: primaryData,
			} );

			expect( state.settings ).to.eql( {
				[ primarySiteId ]: primaryData,
			} );
		} );

		it( 'should accumulate settings', () => {
			const previousState = deepFreeze( {
				settings: {
					[ primarySiteId ]: primaryData,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: secondarySiteId,
				data: secondaryData,
			} );

			expect( state.settings ).to.eql( {
				[ primarySiteId ]: primaryData,
				[ secondarySiteId ]: secondaryData,
			} );
		} );

		it( 'should override previous settings of same site ID', () => {
			const previousState = deepFreeze( {
				settings: {
					[ primarySiteId ]: primaryData,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				data: secondaryData,
			} );

			expect( state.settings ).to.eql( {
				[ primarySiteId ]: secondaryData,
			} );
		} );

		it( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const newData = { is_cache_enabled: false, is_super_cache_enabled: true };
			const previousState = deepFreeze( {
				settings: {
					[ primarySiteId ]: primaryData,
				}
			} );
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				data: newData,
			} );

			expect( state.settings ).to.eql( {
				[ primarySiteId ]: { is_cache_enabled: false, is_super_cache_enabled: true },
			} );
		} );
	} );
} );
