/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginEmailAddressFormInput } from '../';

describe( 'getMagicLoginEmailAddressFormInput()', () => {
	it( 'should return empty string by default', () => {
		const val = getMagicLoginEmailAddressFormInput( undefined );
		expect( val ).to.equal( '' );
	} );

	it( 'should return empty string on empty string', () => {
		const val = getMagicLoginEmailAddressFormInput( '' );
		expect( val ).to.equal( '' );
	} );

	it( 'should return string value', () => {
		const val = getMagicLoginEmailAddressFormInput( {
			login: {
				magicLogin: {
					emailAddressFormInput: 'robertantonwilson@example.com'
				},
			},
		} );
		expect( val ).to.equal( 'robertantonwilson@example.com' );
	} );
} );
