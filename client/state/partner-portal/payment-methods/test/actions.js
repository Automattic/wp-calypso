/**
 * Internal dependencies
 */
import * as actions from 'calypso/state/partner-portal/payment-methods/actions';

describe( 'actions', () => {
	describe( '#changeBrand()', () => {
		test( 'should return an action to change the brand name', () => {
			const { changeBrand } = actions;
			const brandName = 'visa';

			expect( changeBrand( brandName ) ).toEqual( { type: 'BRAND_SET', payload: brandName } );
		} );
	} );

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

	describe( '#setFieldValue()', () => {
		test( 'should return an action with the key and field value', () => {
			const { setFieldValue } = actions;
			const key = 'cvc';
			const value = '123';

			expect( setFieldValue( key, value ) ).toEqual( {
				type: 'FIELD_VALUE_SET',
				payload: { key, value },
			} );
		} );
	} );

	describe( '#setFieldError()', () => {
		test( 'should return an action with the key and error message', () => {
			const { setFieldError } = actions;
			const key = 'cvc';
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
