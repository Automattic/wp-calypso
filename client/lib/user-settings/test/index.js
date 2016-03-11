/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

/**
 * Internal dependencies
 */
var userSettings = require( '../index.js' );

describe( 'User Settings', function() {
	before( function() {
		userSettings.fetchSettings();
	} );

	it( 'should consider overridden settings as saved', function( done ) {
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
} );
