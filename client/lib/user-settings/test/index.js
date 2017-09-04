/**
 * External dependencies
 */
import { assert, expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import wpMock from './mocks/wp';
import userUtilsMock from './mocks/user-utils';

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
} );
