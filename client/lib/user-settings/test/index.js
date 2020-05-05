/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import userSettings from '..';

jest.mock( 'lib/wp', () => require( './mocks/wp' ) );
jest.mock( 'lib/user/utils', () => require( './mocks/user-utils' ) );

describe( 'User Settings', () => {
	beforeEach( () => {
		userSettings.settings = {};
		userSettings.unsavedSettings = {};
		userSettings.fetchSettings();
	} );

	test( 'should consider overridden settings as saved', ( done ) => {
		expect( userSettings.updateSetting( 'test', true ) ).toBe( true );
		expect( userSettings.updateSetting( 'lang_id', true ) ).toBe( true );
		expect( userSettings.unsavedSettings.test ).toBe( true );
		expect( userSettings.unsavedSettings.lang_id ).toBe( true );

		userSettings.saveSettings( assertCorrectSettingIsRemoved, { test: true } );

		function assertCorrectSettingIsRemoved() {
			expect( userSettings.unsavedSettings.test ).toBeUndefined();
			expect( userSettings.unsavedSettings.lang_id ).toBe( true );
			done();
		}
	} );

	describe( '#updateSetting', () => {
		test( 'should treat root language langSlug as an unsaved setting when its locale variant is activated', () => {
			userSettings.settings.language = 'de';
			userSettings.settings.locale_variant = 'de_formal';
			userSettings.updateSetting( 'language', 'de' );
			expect( userSettings.unsavedSettings.language ).toBe( 'de' );
		} );

		test( 'should treat same locale variant language as an already-saved setting', () => {
			userSettings.settings.language = 'de';
			userSettings.settings.locale_variant = 'de_formal';
			userSettings.updateSetting( 'language', 'fr' );
			expect( userSettings.unsavedSettings.language ).toBe( 'fr' );
		} );

		test( 'should treat new root language as an unsaved setting', () => {
			userSettings.settings.language = 'de';
			userSettings.settings.locale_variant = 'de_formal';
			userSettings.updateSetting( 'language', 'de_formal' );
			expect( userSettings.unsavedSettings.language ).toBeUndefined();
		} );
	} );

	describe( '#getOriginalSetting', () => {
		describe( 'when a setting has a truthy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 'someValue';
			} );

			test( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 'someValue';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a setting has a falsy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 0;
			} );

			test( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 0;
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a setting is not found', () => {
			beforeEach( () => {
				delete userSettings.settings.someSetting;
			} );

			test( 'returns null', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = null;
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	test( 'should support flat and deep settings', ( done ) => {
		expect( userSettings.settings.lang_id ).toBe( false );
		expect( userSettings.settings.testParent.testChild ).toBe( false );

		expect( userSettings.updateSetting( 'lang_id', true ) ).toBe( true );
		expect( userSettings.updateSetting( 'testParent.testChild', true ) ).toBe( true );

		expect( userSettings.unsavedSettings.lang_id ).toBe( true );
		expect( userSettings.unsavedSettings.testParent.testChild ).toBe( true );

		userSettings.saveSettings( assertCorrectSettingIsSaved );

		function assertCorrectSettingIsSaved() {
			expect( userSettings.unsavedSettings.lang_id ).toBeUndefined();
			expect( userSettings.unsavedSettings.testParent ).toBeUndefined();
			expect( userSettings.settings.lang_id ).toBe( true );
			expect( userSettings.settings.testParent.testChild ).toBe( true );
			done();
		}
	} );

	test( 'should clean unsaved settings if swaping back to the original value', () => {
		expect( userSettings.settings.test ).toEqual( false );
		expect( userSettings.updateSetting( 'test', true ) ).toBe( true );
		expect( userSettings.unsavedSettings ).toEqual( { test: true } );
		expect( userSettings.updateSetting( 'test', false ) ).toBe( true );
		expect( userSettings.unsavedSettings ).toEqual( {} );
	} );

	test( 'should clean unsaved nested settings if the parent becomes empty', () => {
		expect( userSettings.settings.testParent.testChild ).toBe( false );
		expect( userSettings.updateSetting( 'testParent.testChild', true ) ).toBe( true );
		expect( userSettings.unsavedSettings ).toEqual( { testParent: { testChild: true } } );
		expect( userSettings.updateSetting( 'testParent.testChild', false ) ).toBe( true );
		expect( userSettings.unsavedSettings ).toEqual( {} );
	} );
} );
