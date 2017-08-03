/**
 * External dependencies
 */
import assert from  'assert';

/**
 * Internal dependencies
 */
import phoneValidation from '..';

describe( 'Phone Validation Library', () => {
	it( 'should fail an empty number', () => {
		assert.equal( 'phone_number_empty', phoneValidation( '' ).error );
	} );
	it( 'should fail a short number', () => {
		assert.equal( 'phone_number_too_short', phoneValidation( '+1234567' ).error );
	} );
	it( 'should fail a number containing letters', () => {
		assert.equal( 'phone_number_contains_letters', phoneValidation( '+123456789a' ).error );
	} );
	it( 'should fail a number containing special characters', () => {
		assert.equal( 'phone_number_contains_special_characters', phoneValidation( '+(12345)6789' ).error );
	} );
	it( 'should fail an invalid number', () => {
		assert.equal( 'phone_number_invalid', phoneValidation( '+111111111' ).error );
	} );
	it( 'should pass a valid number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+447941952721' ).info );
	} );
	it( 'should pass a valid 8-digit argentine no-leading-9 number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+5461712345' ).info );
	} );
	it( 'should pass a valid 10-digit argentine no-leading-9 number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+54299123456' ).info );
	} );
	it( 'should pass a valid 8-digit croatian number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+38598123456' ).info );
	} );
	it( 'should pass a valid 8-digit danish number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+4528123456' ).info );
	} );
	it( 'should pass a valid 7-digit jamaican number', () => {
		assert.equal( 'phone_number_valid', phoneValidation( '+18761234567' ).info );
	} );
} );
