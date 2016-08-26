/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { validateCardDetails } from '../validation';

describe( 'validation', function() {
	const validCard = {
		name: 'John Doe',
		number: '4111111111111111',
		'expiration-date': '01/' + moment().add( 1, 'years' ).format( 'YY' ),
		cvv: '111',
		country: 'US',
		'postal-code': '90210'
	};

	describe( '#validateCardDetails', () => {
		it( 'should return no errors when card is valid', function() {
			const result = validateCardDetails( validCard );

			expect( result ).to.be.eql( { errors: {} } );
		} );

		it( 'should return error when card has expiration date in the past', function() {
			const expiredCard = { ...validCard, 'expiration-date': '01/01' };

			const result = validateCardDetails( expiredCard );

			expect( result ).to.be.eql( {
				errors: {
					'expiration-date': [ 'Credit card expiration date is invalid' ]
				}
			} );
		} );
	} );
} );
