import * as actions from 'calypso/state/partner-portal/credit-card-form/actions';

describe( 'actions', () => {
	describe( '#setCardDataError()', () => {
		test( 'should return an action with a type and message', () => {
			const { setCardDataError } = actions;
			const type = 'cvc';
			const message = 'generic error';

			expect( setCardDataError( type, message ) ).toEqual( {
				type: 'CARD_DATA_ERROR_SET',
				payload: { type, message },
			} );
		} );
	} );

	describe( '#setCardDataComplete()', () => {
		test( 'should return an action with type and complete', () => {
			const { setCardDataComplete } = actions;
			const type = 'cvc';
			const complete = true;

			expect( setCardDataComplete( type, complete ) ).toEqual( {
				type: 'CARD_DATA_COMPLETE_SET',
				payload: { type, complete },
			} );
		} );
	} );

	describe( '#setUseAsPrimaryPaymentMethod()', () => {
		test( 'should return an action with boolean value', () => {
			const { setUseAsPrimaryPaymentMethod } = actions;
			const payload = true;

			expect( setUseAsPrimaryPaymentMethod( payload ) ).toEqual( {
				type: 'USE_AS_PRIMARY_PAYMENT_METHOD',
				payload,
			} );
		} );
	} );

	describe( '#setFieldValue()', () => {
		test( 'should return an action with the key and field value', () => {
			const { setFieldValue } = actions;
			const key = 'card';
			const value = '4242424242424242';

			expect( setFieldValue( key, value ) ).toEqual( {
				type: 'FIELD_VALUE_SET',
				payload: { key, value },
			} );
		} );
	} );

	describe( '#setFieldError()', () => {
		test( 'should return an action with the key and error message', () => {
			const { setFieldError } = actions;
			const key = 'card';
			const message = 'generic error';

			expect( setFieldError( key, message ) ).toEqual( {
				type: 'FIELD_ERROR_SET',
				payload: { key, message },
			} );
		} );
	} );

	describe( '#touchAllFields()', () => {
		test( 'should return an action', () => {
			const { touchAllFields } = actions;

			expect( touchAllFields() ).toEqual( { type: 'TOUCH_ALL_FIELDS' } );
		} );
	} );
} );
