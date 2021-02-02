/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { fetching, settings, unsavedSettings, updatingPassword } from '../reducer';
import {
	USER_SETTINGS_REQUEST,
	USER_SETTINGS_REQUEST_FAILURE,
	USER_SETTINGS_REQUEST_SUCCESS,
	USER_SETTINGS_SAVE,
	USER_SETTINGS_SAVE_FAILURE,
	USER_SETTINGS_SAVE_SUCCESS,
	USER_SETTINGS_UNSAVED_CLEAR,
	USER_SETTINGS_UNSAVED_REMOVE,
	USER_SETTINGS_UNSAVED_SET,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ).sort() ).toEqual(
			[ 'fetching', 'settings', 'unsavedSettings', 'updatingPassword', 'updating' ].sort()
		);
	} );

	describe( 'settings', () => {
		test( 'should default to an empty object', () => {
			const state = settings( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store user settings after requested fetch', () => {
			const state = settings( undefined, {
				type: USER_SETTINGS_REQUEST_SUCCESS,
				settingValues: { foo: 'bar' },
			} );

			expect( state ).toEqual( { foo: 'bar' } );
		} );

		test( 'should store user settings after initial update', () => {
			const state = settings( null, {
				type: USER_SETTINGS_SAVE_SUCCESS,
				settingValues: { foo: 'bar' },
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should keep existing settings after update', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );

			const state = settings( original, {
				type: USER_SETTINGS_SAVE_SUCCESS,
				settingValues: { baz: 'qux' },
			} );

			expect( state ).toEqual( {
				foo: 'bar',
				baz: 'qux',
			} );
		} );
	} );

	describe( 'unsavedSettings', () => {
		test( 'should default to empty object', () => {
			const state = unsavedSettings( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		test( 'should store a user settings after it is set', () => {
			const state = unsavedSettings( undefined, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'foo',
				value: 'bar',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should store a nexted user setting', () => {
			const state = unsavedSettings( undefined, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: [ 'foo', 'bar' ],
				value: 'baz',
			} );

			expect( state ).toEqual( {
				foo: {
					bar: 'baz',
				},
			} );
		} );

		test( 'should store additional user setting after it is set', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: 'baz',
				value: 'qux',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
				baz: 'qux',
			} );
		} );

		test( 'should store additional nested user setting after it is set', () => {
			const original = deepFreeze( {
				foo: 'bar',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: [ 'baz', 'bar' ],
				value: 'qux',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
				baz: {
					bar: 'qux',
				},
			} );
		} );

		test( 'should remove a user setting', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: 'baz',
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should remove a nested user setting', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: {
					bar: 'qux',
				},
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: [ 'baz', 'bar' ],
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );

		test( 'should keep non-empty top level setting keys', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: {
					qux: 'bar',
					bar: 'qux',
				},
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: [ 'baz', 'bar' ],
			} );

			expect( state ).toEqual( {
				foo: 'bar',
				baz: {
					qux: 'bar',
				},
			} );
		} );

		test( 'should clear user settings after successful save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR,
			} );

			expect( state ).toEqual( {} );
		} );

		test( 'should clear user settings after successful partial save', () => {
			const original = deepFreeze( {
				foo: 'bar',
				baz: 'qux',
			} );

			const state = unsavedSettings( original, {
				type: USER_SETTINGS_UNSAVED_CLEAR,
				settingNames: [ 'baz' ],
			} );

			expect( state ).toEqual( {
				foo: 'bar',
			} );
		} );
	} );

	describe( 'updatingPassword', () => {
		test( 'should return `true` if user attempts to change their password', () => {
			const action = {
				type: USER_SETTINGS_SAVE,
				settingsOverride: { password: 'arbitrary-password' },
			};

			expect( updatingPassword( false, action ) ).toBe( true );
		} );

		test( "should return `false` if user doesn't attempt to change their password", () => {
			const action = {
				type: USER_SETTINGS_SAVE,
				settingsOverride: { arbitrarySetting: 'arbitrary-setting-value' },
			};

			expect( updatingPassword( false, action ) ).toBe( false );
		} );

		test( 'should return `false` if settings update finished (successfully)', () => {
			const action = { type: USER_SETTINGS_SAVE_SUCCESS };

			expect( updatingPassword( false, action ) ).toBe( false );
		} );

		test( 'should return `false` if settings update finished (with a failure)', () => {
			const action = { type: USER_SETTINGS_SAVE_FAILURE };

			expect( updatingPassword( false, action ) ).toBe( false );
		} );
	} );

	describe( 'fetching', () => {
		test( 'should return `true` if user settings are requested', () => {
			const action = { type: USER_SETTINGS_REQUEST };

			expect( fetching( false, action ) ).toBe( true );
		} );

		test( 'should return `false` if user settings were requested successfully', () => {
			const action = { type: USER_SETTINGS_REQUEST_SUCCESS };

			expect( fetching( true, action ) ).toBe( false );
		} );

		test( 'should return `false` if settings update finished (with a failure)', () => {
			const action = { type: USER_SETTINGS_REQUEST_FAILURE };

			expect( fetching( true, action ) ).toBe( false );
		} );
	} );
} );
