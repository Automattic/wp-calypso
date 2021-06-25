/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, requesting, updating } from '../reducer';
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { useSandbox } from 'calypso/test-helpers/use-sinon';

// mock the real selectors with the same names
function isRequestingSiteMonitorSettings( state, siteId ) {
	return state[ siteId ] ?? false;
}

function isUpdatingSiteMonitorSettings( state, siteId ) {
	return state[ siteId ] ?? false;
}

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual( [
			'items',
			'requesting',
			'updating',
		] );
	} );

	describe( '#items()', () => {
		const settings = {
			email_notifications: true,
			monitor_active: true,
			wp_note_notifications: true,
		};
		const otherSettings = {
			...settings,
			wp_note_notifications: false,
		};

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store monitor settings when received', () => {
			const state = items( undefined, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate monitor settings when receiving for new sites', () => {
			const original = deepFreeze( {
				2916284: settings,
			} );
			const state = items( original, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 77203074,
				settings: otherSettings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
				77203074: otherSettings,
			} );
		} );

		test( 'should overwrite monitor settings when receiving for an existing site', () => {
			const original = deepFreeze( {
				2916284: settings,
				77203074: settings,
			} );
			const state = items( original, {
				type: SITE_MONITOR_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings: otherSettings,
			} );

			expect( state ).toEqual( {
				2916284: otherSettings,
				77203074: settings,
			} );
		} );
	} );

	describe( 'requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track monitor settings request when started', () => {
			const state = requesting( undefined, {
				type: SITE_MONITOR_SETTINGS_REQUEST,
				siteId: 2916284,
			} );

			expect( isRequestingSiteMonitorSettings( state, 2916284 ) ).toBe( true );
		} );

		test( 'should accumulate monitor settings requests when started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST,
				siteId: 77203074,
			} );

			expect( isRequestingSiteMonitorSettings( state, 2916284 ) ).toBe( true );
			expect( isRequestingSiteMonitorSettings( state, 77203074 ) ).toBe( true );
		} );

		test( 'should track monitor settings request when succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );

			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
				siteId: 2916284,
			} );

			expect( isRequestingSiteMonitorSettings( state, 2916284 ) ).toBe( false );
			expect( isRequestingSiteMonitorSettings( state, 77203074 ) ).toBe( true );
		} );

		test( 'should track monitor settings request when failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );

			const state = requesting( original, {
				type: SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
				siteId: 77203074,
			} );

			expect( isRequestingSiteMonitorSettings( state, 2916284 ) ).toBe( false );
			expect( isRequestingSiteMonitorSettings( state, 77203074 ) ).toBe( false );
		} );
	} );

	describe( 'updating()', () => {
		test( 'should default to an empty object', () => {
			const state = updating( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should track monitor settings update when started', () => {
			const state = updating( undefined, {
				type: SITE_MONITOR_SETTINGS_UPDATE,
				siteId: 2916284,
			} );

			expect( isUpdatingSiteMonitorSettings( state, 2916284 ) ).toBe( true );
		} );

		test( 'should accumulate monitor settings updates when started', () => {
			const original = deepFreeze( {
				2916284: true,
			} );
			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE,
				siteId: 77203074,
			} );

			expect( isUpdatingSiteMonitorSettings( state, 2916284 ) ).toBe( true );
			expect( isUpdatingSiteMonitorSettings( state, 77203074 ) ).toBe( true );
		} );

		test( 'should track monitor settings update when succeeded', () => {
			const original = deepFreeze( {
				2916284: true,
				77203074: true,
			} );

			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
				siteId: 2916284,
			} );

			expect( isUpdatingSiteMonitorSettings( state, 2916284 ) ).toBe( false );
			expect( isUpdatingSiteMonitorSettings( state, 77203074 ) ).toBe( true );
		} );

		test( 'should track monitor settings update when failed', () => {
			const original = deepFreeze( {
				2916284: false,
				77203074: true,
			} );

			const state = updating( original, {
				type: SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
				siteId: 77203074,
			} );

			expect( isUpdatingSiteMonitorSettings( state, 2916284 ) ).toBe( false );
			expect( isUpdatingSiteMonitorSettings( state, 77203074 ) ).toBe( false );
		} );
	} );
} );
