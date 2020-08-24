/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import {
	validatePaymentDetails,
	getCreditCardType,
	paymentFieldRules,
	getCreditCardFieldRules,
	mergeValidationRules,
} from '../validation';
import * as processorSpecificMethods from '../processor-specific';

describe( 'validation', () => {
	const validCard = {
		name: 'John Doe',
		number: '4111111111111111',
		'expiration-date': '01/' + moment().add( 1, 'years' ).format( 'YY' ),
		cvv: '111',
		country: 'US',
		'postal-code': '90210',
	};

	const validBrazilianEbanxCard = {
		name: 'Ana Santos Araujo',
		number: '4111111111111111',
		'expiration-date': '01/' + moment().add( 1, 'years' ).format( 'YY' ),
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

	describe( '#validatePaymentDetails', () => {
		test( 'should return no errors when card is valid', () => {
			const result = validatePaymentDetails( validCard );
			expect( result ).toEqual( { errors: {} } );
		} );

		describe( 'validate credit card', () => {
			test( 'should return error when card has expiration date in the past', () => {
				const expiredCard = { ...validCard, 'expiration-date': '01/01' };
				const result = validatePaymentDetails( expiredCard );

				expect( result ).toEqual( {
					errors: {
						'expiration-date': [ 'Credit card expiration date is invalid' ],
					},
				} );
			} );

			test( 'should return error when cvv is the wrong length', () => {
				const invalidCVVCard = { ...validCard, cvv: '12345' };
				const result = validatePaymentDetails( invalidCVVCard );

				expect( result ).toEqual( {
					errors: {
						cvv: [ 'Credit card cvv code is invalid' ],
					},
				} );
			} );
		} );

		describe( 'validate basic non-credit card details', () => {
			test( 'should return error when card holder name is missing', () => {
				const invalidCardHolderName = { ...validCard, name: '' };
				const result = validatePaymentDetails( invalidCardHolderName );

				expect( result ).toEqual( {
					errors: {
						name: [ 'Missing required Cardholder Name field' ],
					},
				} );
			} );

			test( 'should return error when Cardholder Name is missing', () => {
				const invalidCardHolderName = { ...validCard, name: '' };
				const result = validatePaymentDetails( invalidCardHolderName );

				expect( result ).toEqual( {
					errors: {
						name: [ 'Missing required Cardholder Name field' ],
					},
				} );
			} );

			test( 'should return error when Postal Code is missing', () => {
				const invalidCardPostCode = { ...validCard, 'postal-code': '' };
				const result = validatePaymentDetails( invalidCardPostCode );

				expect( result ).toEqual( {
					errors: {
						'postal-code': expect.arrayContaining( [ 'Missing required Postal Code field' ] ),
					},
				} );
			} );

			test( 'should return error when US Postal Code is invalid', () => {
				const invalidCardPostCode = {
					...validCard,
					country: 'US',
					'postal-code': '1234',
				};
				const result = validatePaymentDetails( invalidCardPostCode );

				expect( result ).toEqual( {
					errors: {
						'postal-code': expect.arrayContaining( [
							'Postal Code is invalid. Must be a 5 digit number',
						] ),
					},
				} );
			} );

			test( 'should not return error when US Postal Code is valid', () => {
				const invalidCardPostCode = {
					...validCard,
					country: 'US',
					'postal-code': '90001',
				};
				const result = validatePaymentDetails( invalidCardPostCode );

				expect( result ).not.toEqual( {
					errors: {
						'postal-code': expect.arrayContaining( [
							'Postal Code is invalid. Must be a 5 digit number',
						] ),
					},
				} );
			} );

			test( 'should not return error when non-US Postal Code is invalid', () => {
				const invalidCardPostCode = {
					...validCard,
					country: 'CA', // redundancy for explicitness
					'postal-code': '1234',
				};
				const result = validatePaymentDetails( invalidCardPostCode );

				expect( result ).not.toEqual( {
					errors: {
						'postal-code': expect.arrayContaining( [
							'Postal Code is invalid. Must be a 5 digit number',
						] ),
					},
				} );
			} );
		} );

		describe( 'validate ebanx non-credit card details', () => {
			beforeAll( () => {
				processorSpecificMethods.isEbanxCreditCardProcessingEnabledForCountry = jest
					.fn()
					.mockImplementation( () => true );
				processorSpecificMethods.isValidCPF = jest.fn().mockImplementation( () => true );
			} );

			test( 'should return no errors when details are valid', () => {
				const result = validatePaymentDetails( validBrazilianEbanxCard );

				expect( result ).toEqual( { errors: {} } );
			} );

			test( 'should return error when city is missing', () => {
				const invalidCity = { ...validBrazilianEbanxCard, city: '' };
				const result = validatePaymentDetails( invalidCity );

				expect( result ).toEqual( {
					errors: {
						city: [ 'Missing required City field' ],
					},
				} );
			} );

			test( 'should return error when state is missing', () => {
				const invalidState = { ...validBrazilianEbanxCard, state: '' };
				const result = validatePaymentDetails( invalidState );

				expect( result ).toEqual( {
					errors: {
						state: [ 'Missing required State field' ],
					},
				} );
			} );

			test( 'should return error when address-1 is missing', () => {
				const invalidAddress = { ...validBrazilianEbanxCard, 'address-1': '' };
				const result = validatePaymentDetails( invalidAddress );

				expect( result ).toEqual( {
					errors: {
						'address-1': [ 'Missing required Address field' ],
					},
				} );
			} );

			test( 'should return error when street-number is missing', () => {
				const invalidStNo = { ...validBrazilianEbanxCard, 'street-number': '' };
				const result = validatePaymentDetails( invalidStNo );

				expect( result ).toEqual( {
					errors: {
						'street-number': [ 'Missing required Street Number field' ],
					},
				} );
			} );

			test( 'should return error when phone number is missing', () => {
				const invalidStPhNo = { ...validBrazilianEbanxCard, 'phone-number': '' };
				const result = validatePaymentDetails( invalidStPhNo );

				expect( result ).toEqual( {
					errors: {
						'phone-number': [ 'Missing required Phone Number field' ],
					},
				} );
			} );

			test( 'should return error when street number is invalid', () => {
				const invalidStreetNumber = { ...validBrazilianEbanxCard, 'street-number': '0' };
				const result = validatePaymentDetails( invalidStreetNumber );

				expect( result ).toEqual( {
					errors: {
						'street-number': [ 'Street number is invalid' ],
					},
				} );
			} );

			test( 'should return error when CPF is invalid', () => {
				processorSpecificMethods.isValidCPF = jest.fn().mockImplementation( () => false );
				const invalidCPF = { ...validBrazilianEbanxCard, document: 'blah' };
				const result = validatePaymentDetails( invalidCPF );
				expect( result ).toEqual( {
					errors: {
						document: [
							'Taxpayer Identification Number is invalid. Must be in format: 111.444.777-XX or 11.444.777/0001-XX',
						],
					},
				} );
			} );
		} );
	} );

	describe( '#paymentFieldRules', () => {
		test( 'should return null by default', () => {
			const result = paymentFieldRules();
			expect( result ).toBe( null );
		} );

		test( 'should return credit card field validation rules', () => {
			const result = paymentFieldRules( {}, 'credit-card' );
			expect( result ).toEqual( getCreditCardFieldRules() );
		} );
	} );

	describe( 'mergeValidationRules()', () => {
		test( 'should add additional fields', () => {
			const result = mergeValidationRules(
				{
					bird: {
						description: 'A Bird',
						rules: [ 'can-fly' ],
					},
				},
				{
					plane: {
						description: 'A Plane',
						rules: [ 'can-fly' ],
					},
				}
			);

			expect( result ).toEqual( {
				bird: {
					description: 'A Bird',
					rules: [ 'can-fly' ],
				},
				plane: {
					description: 'A Plane',
					rules: [ 'can-fly' ],
				},
			} );
		} );

		test( 'should add additional tests to existing fields', () => {
			const result = mergeValidationRules(
				{
					bird: {
						description: 'A Bird',
						rules: [ 'can-peck', 'can-fly' ],
					},
				},
				{
					bird: {
						description: 'A Bird',
						rules: [ 'can-fly', 'black' ],
					},
				}
			);

			expect( result ).toEqual( {
				bird: {
					description: 'A Bird',
					rules: [ 'can-peck', 'can-fly', 'black' ],
				},
			} );
		} );

		test( 'should ignore empty values', () => {
			const result = mergeValidationRules(
				{
					bird: {
						description: 'A Bird',
						rules: [ 'can-dodge' ],
					},
				},
				false,
				null,
				undefined,
				[],
				{},
				{
					bird: {
						description: 'A Bird',
						rules: [ 'can-dodge' ],
					},
				}
			);

			expect( result ).toEqual( {
				bird: {
					description: 'A Bird',
					rules: [ 'can-dodge' ],
				},
			} );
		} );
	} );

	describe( 'getCreditCardType', () => {
		describe( 'Discover Card: starts with 6011, 64, 65', () => {
			test( 'should not return Discover for 622125', () => {
				expect( getCreditCardType( '622125' ) ).not.toEqual( 'discover' );
			} );
			test( 'should return `discover` for 6011000990139424', () => {
				expect( getCreditCardType( '6011000990139424' ) ).toEqual( 'discover' );
			} );

			test( 'should return `discover` for 6445644564456445', () => {
				expect( getCreditCardType( '6445644564456445' ) ).toEqual( 'discover' );
			} );
		} );

		describe( 'Mastercard: range 2221-2720', () => {
			test( 'should return `mastercard` for 2221000000000000', () => {
				expect( getCreditCardType( '2221000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 2720990000000000', () => {
				expect( getCreditCardType( '2720990000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 2223003122003222', () => {
				expect( getCreditCardType( '2223003122003222' ) ).toEqual( 'mastercard' );
			} );
		} );

		describe( 'Mastercard: range 51-55', () => {
			test( 'should not return mastercard for 5099999999999999', () => {
				expect( getCreditCardType( '5099999999999999' ) ).not.toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 5100000000000000', () => {
				expect( getCreditCardType( '5100000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should return `mastercard` for 5599000000000000', () => {
				expect( getCreditCardType( '5599000000000000' ) ).toEqual( 'mastercard' );
			} );

			test( 'should not return mastercard for 5600000000000000', () => {
				expect( getCreditCardType( '5600000000000000' ) ).not.toEqual( 'mastercard' );
			} );
		} );

		describe( 'American Express', () => {
			test( 'should return `amex` for 370000000000002', () => {
				expect( getCreditCardType( '370000000000002' ) ).toEqual( 'amex' );
			} );

			test( 'should return `amex` for 378282246310005', () => {
				expect( getCreditCardType( '378282246310005' ) ).toEqual( 'amex' );
			} );
		} );

		describe( 'Visa', () => {
			test( 'should return `visa` for 4242424242424242', () => {
				expect( getCreditCardType( '4242424242424242' ) ).toEqual( 'visa' );
			} );

			test( 'should return `visa` for 4000000400000008', () => {
				expect( getCreditCardType( '4000000400000008' ) ).toEqual( 'visa' );
			} );
		} );

		describe( 'Other Brands', () => {
			test( 'should return `jcb` for 3530111333300000', () => {
				expect( getCreditCardType( '3530111333300000' ) ).toEqual( 'jcb' );
			} );

			test( 'should return `diners` for 30569309025904', () => {
				expect( getCreditCardType( '30569309025904' ) ).toEqual( 'diners' );
			} );

			test( 'should return `diners` for 38520000023237', () => {
				expect( getCreditCardType( '38520000023237' ) ).toEqual( 'diners' );
			} );

			test( 'should return `unionpay` for 6240008631401148', () => {
				expect( getCreditCardType( '6240008631401148' ) ).toEqual( 'unionpay' );
			} );
		} );
	} );
} );
