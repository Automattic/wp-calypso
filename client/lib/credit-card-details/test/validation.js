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

	describe( '#validateCardDetails', () => {
		test( 'should return no errors when card is valid', () => {
			const result = validateCardDetails( validCard );

			expect( result ).to.be.eql( { errors: {} } );
		} );

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
} );
