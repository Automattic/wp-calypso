/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { createPurchasesArray } from '../assembler';

describe( 'Purchases assembler', () => {
	it( 'should be a function', () => {
		expect( createPurchasesArray ).to.be.an( 'function' );
	} );

	it( 'should return an empty array when data transfer object is undefined', () => {
		expect( createPurchasesArray() ).to.be.eql( [] );
	} );

	it( 'should return an empty array when data transfer object is null', () => {
		expect( createPurchasesArray( null ) ).to.be.eql( [] );
	} );

	it( 'should convert the payment credit card data to the right data structure', () => {
		expect( createPurchasesArray( [ {
			payment_card_id: 1234,
			payment_card_type: 'visa',
			payment_details: 7890,
			payment_expiry: '11/16',
			payment_type: 'credit_card'
		} ] ) ).to.have.deep.property( '[0].payment' ).that.deep.equals( {
			creditCard: {
				expiryDate: '11/16',
				expiryMoment: moment( '11/16', 'MM/YY' ),
				id: 1234,
				number: 7890,
				type: 'visa'
			},
			type: 'credit_card'
		} );
	} );
} );
