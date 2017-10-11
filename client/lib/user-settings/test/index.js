/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert, expect } from 'chai';

/**
 * Internal dependencies
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
		assert.isTrue( userSettings.updateSetting( 'test', true ) );
		assert.isTrue( userSettings.updateSetting( 'lang_id', true ) );

		assert.isTrue( userSettings.unsavedSettings.test );
		assert.isTrue( userSettings.unsavedSettings.lang_id );

		userSettings.saveSettings( assertCorrectSettingIsRemoved, { test: true } );

		function assertCorrectSettingIsRemoved() {
			assert.isUndefined( userSettings.unsavedSettings.test );
			assert.isTrue( userSettings.unsavedSettings.lang_id );
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
		assert.isFalse( userSettings.settings.lang_id );
		assert.isFalse( userSettings.settings.testParent.testChild );

		assert.isTrue( userSettings.updateSetting( 'lang_id', true ) );
		assert.isTrue( userSettings.updateSetting( 'testParent.testChild', true ) );

		assert.isTrue( userSettings.unsavedSettings.lang_id );
		assert.isTrue( userSettings.unsavedSettings.testParent.testChild );

		userSettings.saveSettings( assertCorrectSettingIsSaved );

		function assertCorrectSettingIsSaved() {
			assert.isUndefined( userSettings.unsavedSettings.lang_id );
			assert.isUndefined( userSettings.unsavedSettings.testParent );
			assert.isTrue( userSettings.settings.lang_id );
			assert.isTrue( userSettings.settings.testParent.testChild );
			done();
		}
	} );
} );
