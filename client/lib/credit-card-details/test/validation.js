/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { validateCardDetails } from '../validation';
import { isEbanx, isValidCPF } from 'lib/credit-card-details/ebanx';

jest.mock( 'lib/credit-card-details/ebanx', () => {
	return {
		isEbanx: jest.fn( false ),
		isValidCPF: jest.fn( false ),
	};
} );

describe( 'validation', () => {
	const validCard = {
		name: 'John Doe',
		number: '4111111111111111',
		'expiration-date':
			'01/' +
			moment()
				.add( 1, 'years' )
				.format( 'YY' ),
		cvv: '111',
		country: 'US',
		'postal-code': '90210',
	};

	const validBrazilianEbanxCard = {
		name: 'Ana Santos Araujo',
		number: '4111111111111111',
		'expiration-date':
			'01/' +
			moment()
				.add( 1, 'years' )
				.format( 'YY' ),
		cvv: '111',
		country: 'BR',
		'postal-code': '90210',
		city: 'Maracanaú',
		state: 'CE',
		document: '853.513.468-93',
		'phone-number': '+85 2284-7035',
		'address-1': 'Rua E',
		'street-number': '1040',
	};

	describe( '#validateCardDetails', () => {
		test( 'should return no errors when card is valid', () => {
			const result = validateCardDetails( validCard );
			expect( result ).to.be.eql( { errors: {} } );
		} );

		describe( 'validate credit card', () => {
			test( 'should return error when card has expiration date in the past', () => {
				const expiredCard = { ...validCard, 'expiration-date': '01/01' };
				const result = validateCardDetails( expiredCard );

				expect( result ).to.be.eql( {
					errors: {
						'expiration-date': [ 'Credit card expiration date is invalid' ],
					},
				} );
			} );

			test( 'should return error when cvv is the wrong length', () => {
				const invalidCVVCard = { ...validCard, cvv: '12345' };
				const result = validateCardDetails( invalidCVVCard );

				expect( result ).to.be.eql( {
					errors: {
						cvv: [ 'Credit card cvv code is invalid' ],
					},
				} );
			} );
		} );

		describe( 'validate basic non-credit card details', () => {
			test( 'should return error when card holder name is missing', () => {
				const invalidCardHolderName = { ...validCard, name: '' };
				const result = validateCardDetails( invalidCardHolderName );

				expect( result ).to.be.eql( {
					errors: {
						name: [ 'Missing required Name on Card field' ],
					},
				} );
			} );

			test( 'should return error when Name on Card is missing', () => {
				const invalidCardHolderName = { ...validCard, name: '' };
				const result = validateCardDetails( invalidCardHolderName );

				expect( result ).to.be.eql( {
					errors: {
						name: [ 'Missing required Name on Card field' ],
					},
				} );
			} );

			test( 'should return error when Postal Code is missing', () => {
				const invalidCardPostCode = { ...validCard, 'postal-code': '' };
				const result = validateCardDetails( invalidCardPostCode );

				expect( result ).to.be.eql( {
					errors: {
						'postal-code': [ 'Missing required Postal Code field' ],
					},
				} );
			} );
		} );

		describe( 'validate ebanx non-credit card details', () => {
			beforeAll( () => {
				isEbanx.mockReturnValue( true );
				isValidCPF.mockReturnValue( true );
			} );

			test( 'should return no errors when details are valid', () => {
				const result = validateCardDetails( validBrazilianEbanxCard );

				expect( result ).to.be.eql( { errors: {} } );
			} );

			test( 'should return error when city is missing', () => {
				const invalidCity = { ...validBrazilianEbanxCard, city: '' };
				const result = validateCardDetails( invalidCity );

				expect( result ).to.be.eql( {
					errors: {
						city: [ 'Missing required City field' ],
					},
				} );
			} );

			test( 'should return error when state is missing', () => {
				const invalidState = { ...validBrazilianEbanxCard, state: '' };
				const result = validateCardDetails( invalidState );

				expect( result ).to.be.eql( {
					errors: {
						state: [ 'Missing required State field' ],
					},
				} );
			} );

			test( 'should return error when address-1 is missing', () => {
				const invalidAddress = { ...validBrazilianEbanxCard, 'address-1': '' };
				const result = validateCardDetails( invalidAddress );

				expect( result ).to.be.eql( {
					errors: {
						'address-1': [ 'Missing required Address field' ],
					},
				} );
			} );

			test( 'should return error when street-number is missing', () => {
				const invalidStNo = { ...validBrazilianEbanxCard, 'street-number': '' };
				const result = validateCardDetails( invalidStNo );

				expect( result ).to.be.eql( {
					errors: {
						'street-number': [ 'Missing required Street Number field' ],
					},
				} );
			} );

			test( 'should return error when phone number is missing', () => {
				const invalidStPhNo = { ...validBrazilianEbanxCard, 'phone-number': '' };
				const result = validateCardDetails( invalidStPhNo );

				expect( result ).to.be.eql( {
					errors: {
						'phone-number': [ 'Missing required Phone Number field' ],
					},
				} );
			} );

			test( 'should return error when CPF is invalid', () => {
				isValidCPF.mockReturnValue( false );
				const invalidCPF = { ...validBrazilianEbanxCard, document: 'blah' };
				const result = validateCardDetails( invalidCPF );
				expect( result ).to.be.eql( {
					errors: {
						document: [
							'Taxpayer Identification Number is invalid. Must be in format: 111.444.777-XX',
						],
					},
				} );
			} );
		} );
	} );
} );
