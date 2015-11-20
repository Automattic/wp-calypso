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
		userSettings.updateSetting( 'test', true );
		userSettings.updateSetting( 'surprise_me', true );
		assert.equal( true, userSettings.unsavedSettings.test );
		assert.equal( true, userSettings.unsavedSettings.surprise_me );

		userSettings.saveSettings( assertCorrectSettingIsRemoved,
			{ test: true } );

		function assertCorrectSettingIsRemoved() {
			assert.isUndefined( userSettings.unsavedSettings.test );
			assert.equal( true, userSettings.unsavedSettings.surprise_me );
			done();
		}
	} );
} );
