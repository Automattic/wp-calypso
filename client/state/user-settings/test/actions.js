/**
 * Internal dependencies
 */
import { setUserSetting } from '../actions';
import {
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'updateUserSetting()', () => {
		test( 'should store the new value to unsaved settings', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: {},
				},
			} );

			const result = setUserSetting( 'foo', 'qix' )( dispatch, getState );

			expect( result ).toBe( true );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: [ 'foo' ],
				value: 'qix',
			} );
		} );

		test( 'should remove the value from unsaved settings after it is reset to original value', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: { foo: 'qix' },
				},
			} );

			const result = setUserSetting( 'foo', 'bar' )( dispatch, getState );

			expect( result ).toBe( true );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: [ 'foo' ],
			} );
		} );

		test( 'should ignore update of a setting that is not already in the server data', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: { foo: 'bar' },
					unsavedSettings: {},
				},
			} );

			const result = setUserSetting( 'baz', 'qix' )( dispatch, getState );

			expect( result ).toBe( false );
			expect( dispatch ).toHaveBeenCalledTimes( 0 );
		} );
	} );
} );
