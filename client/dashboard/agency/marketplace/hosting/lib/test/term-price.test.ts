import { getTermPrice } from '../term-price';

describe( 'getTermPrice', () => {
	test( 'reads a yearly price per month, with the yearly total as a note', () => {
		expect( getTermPrice( 600, 'USD', 'yearly' ) ).toEqual( {
			price: '$50.00',
			billed: 'Billed yearly, $600.00',
		} );
	} );

	test( 'reads a monthly price as it is, with no note', () => {
		expect( getTermPrice( 50, 'USD', 'monthly' ) ).toEqual( { price: '$50.00', billed: '' } );
	} );

	test( 'follows how the product is billed when it has only one term', () => {
		// Shown yearly, billed monthly: the price is twelve monthly payments.
		expect( getTermPrice( 1200, 'USD', 'yearly', 'monthly' ) ).toEqual( {
			price: '$100.00',
			billed: '',
		} );
		// Shown monthly, billed yearly: the price is the yearly total over twelve.
		expect( getTermPrice( 50, 'USD', 'monthly', 'yearly' ) ).toEqual( {
			price: '$50.00',
			billed: 'Billed yearly, $600.00',
		} );
	} );
} );
