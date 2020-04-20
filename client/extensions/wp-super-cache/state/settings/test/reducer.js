/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_RESTORE_SETTINGS,
	WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
} from '../../action-types';
import reducer, { items, restoring } from '../reducer';
import { SERIALIZE, DESERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'requesting()', () => {
		const previousState = deepFreeze( {
			requesting: {
				[ primarySiteId ]: true,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.requesting ).to.eql( {} );
		} );

		test( 'should set request to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate requesting values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.requesting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.requesting ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.requesting ).to.eql( {} );
		} );
	} );

	describe( 'saveStatus()', () => {
		const previousState = deepFreeze( {
			saveStatus: {
				[ primarySiteId ]: {
					saving: true,
					status: 'pending',
					error: false,
				},
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.saveStatus ).to.eql( {} );
		} );

		test( 'should set save status to pending if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_SAVE_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state.saveStatus ).to.eql( {
				[ primarySiteId ]: {
					saving: true,
					status: 'pending',
					error: false,
				},
			} );
		} );

		test( 'should accumulate save request statuses', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_SAVE_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state.saveStatus ).to.eql( {
				[ primarySiteId ]: {
					saving: true,
					status: 'pending',
					error: false,
				},
				[ secondarySiteId ]: {
					saving: true,
					status: 'pending',
					error: false,
				},
			} );
		} );

		test( 'should set save request to success if request finishes successfully', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state.saveStatus ).to.eql( {
				[ primarySiteId ]: {
					saving: false,
					status: 'success',
					error: false,
				},
			} );
		} );

		test( 'should set save request to error if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
				siteId: primarySiteId,
				error: 'my error',
			} );

			expect( state.saveStatus ).to.eql( {
				[ primarySiteId ]: {
					saving: false,
					status: 'error',
					error: 'my error',
				},
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.saveStatus ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.saveStatus ).to.eql( {} );
		} );
	} );

	describe( 'restoring()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		test( 'should default to an empty object', () => {
			const state = restoring( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set request to true if request in progress', () => {
			const state = restoring( undefined, {
				type: WP_SUPER_CACHE_RESTORE_SETTINGS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate restoring values', () => {
			const state = restoring( previousState, {
				type: WP_SUPER_CACHE_RESTORE_SETTINGS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set request to false if request finishes successfully', () => {
			const state = restoring( previousState, {
				type: WP_SUPER_CACHE_RESTORE_SETTINGS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set request to false if request finishes with failure', () => {
			const state = restoring( previousState, {
				type: WP_SUPER_CACHE_RESTORE_SETTINGS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = restoring( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = restoring( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		const primarySettings = { is_cache_enabled: true };
		const secondarySettings = { is_cache_enabled: false };
		const previousState = deepFreeze( {
			items: {
				[ primarySiteId ]: primarySettings,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.items ).to.eql( {} );
		} );

		test( 'should index settings by site ID', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: primarySettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should accumulate settings', () => {
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

		test( 'should override previous settings of same site ID', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: secondarySettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: secondarySettings,
			} );
		} );

		test( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const newSettings = { is_cache_enabled: false, is_super_cache_enabled: true };
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_RECEIVE_SETTINGS,
				siteId: primarySiteId,
				settings: newSettings,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: { is_cache_enabled: false, is_super_cache_enabled: true },
			} );
		} );

		test( 'should persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.root().items ).to.eql( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {
				[ primarySiteId ]: primarySettings,
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				items: {
					[ primarySiteId ]: 2,
				},
			} );
			const state = reducer( previousInvalidState, {
				type: DESERIALIZE,
			} );

			expect( state.items ).to.eql( {} );
		} );

		test( 'should set is_preloading to true after switching preloading on', () => {
			const state = items(
				{
					[ primarySiteId ]: {
						is_preloading: false,
					},
				},
				{
					type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
					siteId: primarySiteId,
					preloading: true,
				}
			);

			expect( state[ primarySiteId ].is_preloading ).to.be.true;
		} );

		test( 'should set is_preloading to false after switching preloading off', () => {
			const state = items(
				{
					[ primarySiteId ]: {
						is_preloading: true,
					},
				},
				{
					type: WP_SUPER_CACHE_PRELOAD_CACHE_SUCCESS,
					siteId: primarySiteId,
					preloading: false,
				}
			);

			expect( state[ primarySiteId ].is_preloading ).to.be.false;
		} );
	} );
} );
