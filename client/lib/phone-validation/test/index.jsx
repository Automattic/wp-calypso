/**
 * External dependencies
 */
var assert = require( 'assert' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' ),
	phoneValidation = require( '../' );

i18n.initialize(); // This is needed since the tests are called independently of the framework

describe( 'Phone Validation Library', function() {
	it( 'should fail an empty number', function() {
		assert.equal( 'phone_number_empty', phoneValidation( '' ).error );
	} );
	it( 'should fail a short number', function() {
		assert.equal( 'phone_number_too_short', phoneValidation( '+1234567' ).error );
	} );
	it( 'should fail a number containing letters', function() {
		assert.equal( 'phone_number_contains_letters', phoneValidation( '+123456789a' ).error );
	} );
	it( 'should fail a number containing special characters', function() {
		assert.equal( 'phone_number_contains_special_characters', phoneValidation( '+(12345)6789' ).error );
	} );
	it( 'should fail an invalid number', function() {
		assert.equal( 'phone_number_invalid', phoneValidation( '+111111111' ).error );
	} );
	it( 'should pass a valid number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+447941952721' ).info );
	} );
	it( 'should pass a valid 8-digit argentine no-leading-9 number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+5461712345' ).info );
	} );
	it( 'should pass a valid 10-digit argentine no-leading-9 number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+54299123456' ).info );
	} );
	it( 'should pass a valid 8-digit croatian number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+38598123456' ).info );
	} );
	it( 'should pass a valid 8-digit danish number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+4528123456' ).info );
	} );
	it( 'should pass a valid 7-digit jamaican number', function() {
		assert.equal( 'phone_number_valid', phoneValidation( '+18761234567' ).info );
	} );
} );
