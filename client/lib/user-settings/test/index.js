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
		userSettings.updateSetting( 'lang_id', true );
		assert.equal( true, userSettings.unsavedSettings.test );
		assert.equal( true, userSettings.unsavedSettings.lang_id );

		userSettings.saveSettings( assertCorrectSettingIsRemoved,
			{ test: true } );

		function assertCorrectSettingIsRemoved() {
			assert.isUndefined( userSettings.unsavedSettings.test );
			assert.equal( true, userSettings.unsavedSettings.lang_id );
			done();
		}
	} );
} );
