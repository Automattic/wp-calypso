import { createPurchasesArray } from '../assembler';

describe( 'assembler', () => {
	test( 'should be a function', () => {
		expect( createPurchasesArray ).toBeInstanceOf( Function );
	} );

	test( 'should return an empty array when data transfer object is undefined', () => {
		expect( createPurchasesArray() ).toEqual( [] );
	} );

	test( 'should return an empty array when data transfer object is null', () => {
		expect( createPurchasesArray( null ) ).toEqual( [] );
	} );

	test( 'should convert the payment credit card data to the right data structure', () => {
		const purchase = createPurchasesArray( [
			{
				stored_details_id: 1234,
				payment_card_id: 1234,
				payment_card_type: 'visa',
				payment_details: 7890,
				payment_expiry: '11/16',
				payment_type: 'credit_card',
				payment_card_processor: 'WPCOM_Billing_Stripe_Payment_Method',
				payment_name: 'My VISA',
				payment_country_code: 'US',
				payment_country_name: 'United States',
			},
		] );
		const payment = purchase[ 0 ].payment;
		const creditCard = payment.creditCard;
		expect( creditCard.expiryDate ).toEqual( '11/16' );
		expect( creditCard.id ).toEqual( 1234 );
		expect( creditCard.number ).toEqual( 7890 );
		expect( creditCard.type ).toEqual( 'visa' );
		expect( creditCard.processor ).toEqual( 'WPCOM_Billing_Stripe_Payment_Method' );
		expect( payment.type ).toEqual( 'credit_card' );
		expect( payment.countryCode ).toEqual( 'US' );
		expect( payment.countryName ).toEqual( 'United States' );
		expect( payment.name ).toEqual( 'My VISA' );
		expect( payment.storedDetailsId ).toEqual( 1234 );
	} );
} );
