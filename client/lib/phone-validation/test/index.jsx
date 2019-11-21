/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
import phoneValidation from '..';

describe( 'Phone Validation Library', () => {
	test( 'should fail an empty number', () => {
		assert.strictEqual( phoneValidation( '' ).error, 'phone_number_empty' );
	} );
	test( 'should fail a short number', () => {
		assert.strictEqual( phoneValidation( '+1234567' ).error, 'phone_number_too_short' );
	} );
	test( 'should fail a number containing letters', () => {
		assert.strictEqual( phoneValidation( '+123456789a' ).error, 'phone_number_contains_letters' );
	} );
	test( 'should fail a number containing special characters', () => {
		assert.strictEqual(
			phoneValidation( '+(12345)6789' ).error,
			'phone_number_contains_special_characters'
		);
	} );
	test( 'should fail an invalid number', () => {
		assert.strictEqual( phoneValidation( '+111111111' ).error, 'phone_number_invalid' );
	} );
	test( 'should pass a valid number', () => {
		assert.strictEqual( phoneValidation( '+447941952721' ).info, 'phone_number_valid' );
	} );
	test( 'should fail an invalid 9-digit argentine number', () => {
		assert.strictEqual( phoneValidation( '+54299123456' ).error, 'phone_number_invalid' );
	} );
	test( 'should pass a valid 10 digit argentine without leading 9 number', () => {
		assert.strictEqual( phoneValidation( '+542231234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid 10 digit argentine with leading 9 number', () => {
		assert.strictEqual( phoneValidation( '+5492231234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid 8-digit croatian number', () => {
		assert.strictEqual( phoneValidation( '+38598123456' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid 8-digit danish number', () => {
		assert.strictEqual( phoneValidation( '+4528123456' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid 7-digit jamaican number', () => {
		assert.strictEqual( phoneValidation( '+18761234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid new format vietnamese number starting with 7', () => {
		assert.strictEqual( phoneValidation( '+84761234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid new format vietnamese number starting with 3', () => {
		assert.strictEqual( phoneValidation( '+84361234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid new format vietnamese number with leading zero', () => {
		assert.strictEqual( phoneValidation( '+840361234567' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid greenland number starting with 2', () => {
		assert.strictEqual( phoneValidation( '+299239349' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid qatari number', () => {
		assert.strictEqual( phoneValidation( '+97466641333' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid myanmar number with 7 digits after leading 9', () => {
		assert.strictEqual( phoneValidation( '+9595512345' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid myanmar number with 8 digits after leading 9', () => {
		assert.strictEqual( phoneValidation( '+95942612345' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid myanmar number with 9 digits after leading 9', () => {
		assert.strictEqual( phoneValidation( '+959426123456' ).info, 'phone_number_valid' );
	} );
	test( 'should pass a valid Brazilian number starting with 49', () => {
		assert.strictEqual( phoneValidation( '+554912345678' ).info, 'phone_number_valid' );
	} );
} );
