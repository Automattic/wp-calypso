import * as selectors from 'calypso/state/partner-portal/credit-card-form/selectors';

describe( 'selectors', () => {
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
					card: {
						value: '4242424242424242',
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
					card: false,
				},
			};

			expect( getIncompleteFieldKeys( state ) ).toEqual( [ 'card' ] );
		} );
	} );

	describe( '#useAsPrimaryPaymentMethod()', () => {
		test( 'should return the boolean value of useAsPrimaryPaymentMethod', () => {
			const { useAsPrimaryPaymentMethod } = selectors;
			const state = {
				useAsPrimaryPaymentMethod: true,
			};

			expect( useAsPrimaryPaymentMethod( state ) ).toEqual( state.useAsPrimaryPaymentMethod );
		} );
	} );
} );
