/**
 * Internal dependencies
 */
import * as selectors from 'calypso/state/partner-portal/payment-methods/selectors';

describe( 'selectors', () => {
	describe( '#getBrand()', () => {
		test( 'should return the name of the brand', () => {
			const { getBrand } = selectors;
			const state = {
				brand: 'visa',
			};

			expect( getBrand( state ) ).toEqual( state.brand );
		} );

		test( 'should return an empty string by default', () => {
			const { getBrand } = selectors;
			const state = {};

			expect( getBrand( state ) ).toEqual( '' );
		} );
	} );

	describe( '#getCardDataErrors()', () => {
		test( 'should return all the card data errors', () => {
			const { getCardDataErrors } = selectors;
			const state = {
				cardDataErrors: {
					cardCvc: 'Generic Error.',
				},
			};

			expect( getCardDataErrors( state ) ).toEqual( state.cardDataErrors );

			const newState = {
				cardDataErrors: {
					...state.cardDataErrors,
					cardNumber: 'Another Generic Error',
				},
			};

			expect( getCardDataErrors( newState ) ).toEqual( newState.cardDataErrors );
		} );
	} );

	describe( '#getFields()', () => {
		test( 'should return the stored fields', () => {
			const { getFields } = selectors;
			const state = {
				fields: {
					cardCvc: {
						value: 123,
						isTouched: true,
					},
				},
			};

			expect( getFields( state ) ).toEqual( state.fields );
		} );
	} );

	describe( '#getIncompleteFieldKeys()', () => {
		test( 'should return all the incomplete field keys', () => {
			const { getIncompleteFieldKeys } = selectors;
			const state = {
				cardDataComplete: {
					cardCvc: false,
					cardNumber: true,
					cardExpiry: true,
				},
			};

			expect( getIncompleteFieldKeys( state ) ).toEqual( [ 'cardCvc' ] );
		} );
	} );
} );
