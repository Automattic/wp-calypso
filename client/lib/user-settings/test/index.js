/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import userSettings from '..';

jest.mock( 'lib/localforage', () => require( 'lib/localforage/localforage-bypass' ) );
jest.mock( 'lib/wp', () => require( './mocks/wp' ) );
jest.mock( 'lib/user/utils', () => require( './mocks/user-utils' ) );

describe( 'User Settings', () => {
	beforeAll( () => {
		userSettings.fetchSettings();
	} );

	test( 'should consider overridden settings as saved', done => {
		expect( userSettings.updateSetting( 'test', true ) ).toBe( true );
		expect( userSettings.updateSetting( 'lang_id', true ) ).toBe( true );

		expect( userSettings.unsavedSettings.test ).toBe( true );
		expect( userSettings.unsavedSettings.lang_id ).toBe( true );

		userSettings.saveSettings( assertCorrectSettingIsRemoved, { test: true } );

		function assertCorrectSettingIsRemoved() {
			expect( userSettings.unsavedSettings.test ).not.toBeDefined();
			expect( userSettings.unsavedSettings.lang_id ).toBe( true );
			done();
		}
	} );

	describe( '#getOriginalSetting', () => {
		describe( 'when a setting has a truthy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 'someValue';
			} );

			test( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 'someValue';
				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when a setting has a falsy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 0;
			} );

			test( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 0;
				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when a setting is not found', () => {
			beforeEach( () => {
				delete userSettings.settings.someSetting;
			} );

			test( 'returns null', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = null;
				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	test( 'should support flat and deep settings', done => {
		expect( userSettings.settings.lang_id ).toBe( false );
		expect( userSettings.settings.testParent.testChild ).toBe( false );

		expect( userSettings.updateSetting( 'lang_id', true ) ).toBe( true );
		expect( userSettings.updateSetting( 'testParent.testChild', true ) ).toBe( true );

		expect( userSettings.unsavedSettings.lang_id ).toBe( true );
		expect( userSettings.unsavedSettings.testParent.testChild ).toBe( true );

		userSettings.saveSettings( assertCorrectSettingIsSaved );

		function assertCorrectSettingIsSaved() {
			expect( userSettings.unsavedSettings.lang_id ).not.toBeDefined();
			expect( userSettings.unsavedSettings.testParent ).not.toBeDefined();
			expect( userSettings.settings.lang_id ).toBe( true );
			expect( userSettings.settings.testParent.testChild ).toBe( true );
			done();
		}
	} );
} );
