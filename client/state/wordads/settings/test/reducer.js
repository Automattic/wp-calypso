/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items, requests } from '../reducer';
import {
	DESERIALIZE,
	SERIALIZE,
	WORDADS_SETTINGS_RECEIVE,
	WORDADS_SETTINGS_SAVE,
	WORDADS_SETTINGS_SAVE_FAILURE,
	WORDADS_SETTINGS_SAVE_SUCCESS,
	WORDADS_SETTINGS_UPDATE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	const originalConsoleWarn = global.console.warn;

	beforeAll( () => {
		global.console.warn = jest.fn();
	} );

	afterAll( () => {
		global.console.warn = originalConsoleWarn;
	} );

	describe( 'items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should index settings by site ID', () => {
			const settings = { paypal: 'support@wordpress.com' };
			const state = items( null, {
				type: WORDADS_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate settings', () => {
			const settings = { paypal: 'support@wordpress.com' };
			const previousState = deepFreeze( {
				2916284: { paypal: 'example@wordpress.com' },
			} );
			const state = items( previousState, {
				type: WORDADS_SETTINGS_RECEIVE,
				siteId: 2916285,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: { paypal: 'example@wordpress.com' },
				2916285: settings,
			} );
		} );

		test( 'should override previous settings of same site ID', () => {
			const settings = { paypal: 'support@wordpress.com' };
			const previousState = deepFreeze( {
				2916284: { paypal: 'ribs' },
			} );
			const state = items( previousState, {
				type: WORDADS_SETTINGS_RECEIVE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should accumulate new settings and overwrite existing ones for the same site ID', () => {
			const settings = { paypal: 'support@wordpress.com', us_resident: 'no' };
			const previousState = deepFreeze( {
				2916284: { paypal: 'support@wordpress.com' },
			} );
			const state = items( previousState, {
				type: WORDADS_SETTINGS_UPDATE,
				siteId: 2916284,
				settings,
			} );

			expect( state ).toEqual( {
				2916284: settings,
			} );
		} );

		test( 'should persist state', () => {
			const previousState = deepFreeze( {
				2916284: { paypal: 'support@wordpress.com' },
			} );
			const state = items( previousState, { type: SERIALIZE } );

			expect( state ).toEqual( {
				2916284: { paypal: 'support@wordpress.com' },
			} );
		} );

		test( 'should load valid persisted state', () => {
			const previousState = deepFreeze( {
				2916284: { paypal: 'support@wordpress.com' },
			} );
			const state = items( previousState, { type: DESERIALIZE } );

			expect( state ).toEqual( {
				2916284: { paypal: 'support@wordpress.com' },
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const previousInvalidState = deepFreeze( {
				2454: 2,
			} );
			const state = items( previousInvalidState, { type: DESERIALIZE } );

			expect( state ).toEqual( {} );
		} );
	} );

	describe( 'requests()', () => {
		test( 'should default to an empty object', () => {
			const state = requests( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should set request status to true if request in progress', () => {
			const state = requests( undefined, {
				type: WORDADS_SETTINGS_SAVE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: true,
			} );
		} );

		test( 'should accumulate requests statuses', () => {
			const previousState = deepFreeze( {
				2916284: false,
			} );
			const state = requests( previousState, {
				type: WORDADS_SETTINGS_SAVE,
				siteId: 2916285,
			} );

			expect( state ).toEqual( {
				2916284: false,
				2916285: true,
			} );
		} );

		test( 'should set request for site to false if request finishes successfully', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requests( previousState, {
				type: WORDADS_SETTINGS_SAVE_SUCCESS,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );

		test( 'should set request for site to false if request finishes with failure', () => {
			const previousState = deepFreeze( {
				2916284: true,
			} );
			const state = requests( previousState, {
				type: WORDADS_SETTINGS_SAVE_FAILURE,
				siteId: 2916284,
			} );

			expect( state ).toEqual( {
				2916284: false,
			} );
		} );

		test( 'should not persist state', () => {
			const previousState = deepFreeze( {
				2916284: false,
			} );
			const state = requests( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).toBeUndefined();
		} );

		test( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				2916284: false,
			} );
			const state = requests( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).toEqual( {} );
		} );
	} );
} );
