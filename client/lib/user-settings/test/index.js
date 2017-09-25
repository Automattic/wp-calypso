/**
 * External dependencies
 */
import { assert, expect } from 'chai';

/**
 * Internal dependencies
 */
import userUtilsMock from './mocks/user-utils';
import wpMock from './mocks/wp';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'User Settings', () => {
	let userSettings;

	useMockery( mockery => {
		mockery.registerMock( 'lib/wp', wpMock );
		mockery.registerMock( 'lib/user/utils', userUtilsMock );
	} );

	useFakeDom();

	before( () => {
		userSettings = require( '..' );
		userSettings.fetchSettings();
	} );

	it( 'should consider overridden settings as saved', done => {
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
		context( 'when a setting has a truthy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 'someValue';
			} );

			it( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 'someValue';
				expect( actual ).to.equal( expected );
			} );
		} );

		context( 'when a setting has a falsy value', () => {
			beforeEach( () => {
				userSettings.settings.someSetting = 0;
			} );

			it( 'returns the value of that setting', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = 0;
				expect( actual ).to.equal( expected );
			} );
		} );

		context( 'when a setting is not found', () => {
			beforeEach( () => {
				delete userSettings.settings.someSetting;
			} );

			it( 'returns null', () => {
				const actual = userSettings.getOriginalSetting( 'someSetting' );
				const expected = null;
				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	it( 'should support flat and deep settings', done => {
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
