/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:i18n-utils:test' ), // eslint-disable-line no-unused-vars
	assert = require( 'assert' );

/**
 * Internal dependencies
 */
var removeLocaleFromPath = require( '../utils.js' ).removeLocaleFromPath;

describe( 'removeLocaleFromPath', function() {
	it( 'should remove the :lang part of the URL', function() {
		assert.equal( removeLocaleFromPath( '/start/fr' ), '/start' );
		assert.equal( removeLocaleFromPath( '/start/flow/fr' ), '/start/flow' );
		assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
	} );

	it( 'should not remove the :flow part of the URL', function() {
		assert.equal( removeLocaleFromPath( '/start' ), '/start' );
		assert.equal( removeLocaleFromPath( '/start/flow' ), '/start/flow' );
	} );

	it( 'should not remove the :step part of the URL', function() {
		assert.equal( removeLocaleFromPath( '/start/flow/step' ), '/start/flow/step' );
	} );
} );
