/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { createPurchasesArray } from '../assembler';

describe( 'assembler', () => {
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
		const purchase = createPurchasesArray( [
			{
				payment_card_id: 1234,
				payment_card_type: 'visa',
				payment_details: 7890,
				payment_expiry: '11/16',
				payment_type: 'credit_card',
				payment_name: 'My VISA',
				payment_country_code: 'US',
				payment_country_name: 'United States',
			},
		] );
		const payment = purchase[ 0 ].payment;
		const creditCard = payment.creditCard;
		expect( creditCard.expiryDate ).to.equal( '11/16' );
		expect( creditCard.expiryMoment.isSame( moment( '11/16', 'MM/YY' ) ) ).to.equal( true );
		expect( creditCard.id ).to.equal( 1234 );
		expect( creditCard.number ).to.equal( 7890 );
		expect( creditCard.type ).to.equal( 'visa' );
		expect( payment.type ).to.equal( 'credit_card' );
		expect( payment.countryCode ).to.equal( 'US' );
		expect( payment.countryName ).to.equal( 'United States' );
		expect( payment.name ).to.equal( 'My VISA' );
	} );
} );
