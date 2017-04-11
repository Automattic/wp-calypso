/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMagicLoginEmailAddressFormInputIsValid } from '../';

describe( 'getMagicLoginEmailAddressFormInputIsValid()', () => {
	it( 'should return false if there is no input yet', () => {
		const isValid = getMagicLoginEmailAddressFormInputIsValid( undefined );
		expect( isValid ).to.be.false;
	} );

	it( 'should return false if input is not an email address', () => {
		const isValid = getMagicLoginEmailAddressFormInputIsValid( {
			login: {
				magicLogin: {
					emailAddressFormInput: 'robertantonwilson@example.',
				},
			},
		} );
		expect( isValid ).to.be.false;
	} );

	it( 'should return true if input is an email address', () => {
		const isValid = getMagicLoginEmailAddressFormInputIsValid( {
			login: {
				magicLogin: {
					emailAddressFormInput: 'robertantonwilson@example.com',
				},
			},
		} );
		expect( isValid ).to.be.true;
	} );
} );
