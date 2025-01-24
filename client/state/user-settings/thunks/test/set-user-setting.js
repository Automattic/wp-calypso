import {
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'calypso/state/action-types';
import setUserSetting from '../set-user-setting';

describe( 'setUserSetting()', () => {
	test( 'should store the new value to unsaved settings', () => {
		const dispatch = jest.fn();
		const getState = () => ( {
			userSettings: {
				settings: { foo: 'bar' },
				unsavedSettings: {},
			},
		} );

		setUserSetting( 'foo', 'qix' )( dispatch, getState );

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

		setUserSetting( 'foo', 'bar' )( dispatch, getState );

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

		setUserSetting( 'baz', 'qix' )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledTimes( 0 );
	} );

	test( 'should not consider settings unchanged when set back to original values for `user_login`', () => {
		const dispatch = jest.fn();
		const getState = () => ( {
			userSettings: {
				settings: {
					user_login: 'foo',
				},
				unsavedSettings: {
					user_login: 'bar',
				},
			},
		} );

		setUserSetting( 'user_login', 'foo' )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledWith( {
			type: USER_SETTINGS_UNSAVED_SET,
			settingName: [ 'user_login' ],
			value: 'foo',
		} );
	} );

	describe( 'language settings', () => {
		test( 'should treat root language as an unsaved setting when its locale variant is activated', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: {
						language: 'foo',
						locale_variant: 'foo-bar',
					},
					unsavedSettings: {},
				},
			} );

			setUserSetting( 'language', 'foo' )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: [ 'language' ],
				value: 'foo',
			} );
		} );

		test( 'should treat same locale variant language as an already-saved setting', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: {
						language: 'foo',
						locale_variant: 'foo-bar',
					},
					unsavedSettings: {},
				},
			} );

			setUserSetting( 'language', 'foo-bar' )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: USER_SETTINGS_UNSAVED_REMOVE,
				settingName: [ 'language' ],
			} );
		} );

		test( 'should treat new root language as an unsaved setting', () => {
			const dispatch = jest.fn();
			const getState = () => ( {
				userSettings: {
					settings: {
						language: 'foo',
						locale_variant: 'foo-bar',
					},
					unsavedSettings: {},
				},
			} );

			setUserSetting( 'language', 'baz' )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: USER_SETTINGS_UNSAVED_SET,
				settingName: [ 'language' ],
				value: 'baz',
			} );
		} );
	} );
} );
