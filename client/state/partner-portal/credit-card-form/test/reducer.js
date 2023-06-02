import deepFreeze from 'deep-freeze';
import reducer from '../reducer';

describe( 'reducer', () => {
	const initialState = {
		fields: {},
		cardDataComplete: {
			card: false,
		},
		cardDataErrors: {},
		useAsPrimaryPaymentMethod: true,
	};

	test( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).toEqual( initialState );
	} );

	test( 'should return an object with field value set', () => {
		const key = 'card';
		const value = '4242424242424242';
		const payload = { key, value };
		expect( reducer( undefined, { type: 'FIELD_VALUE_SET', payload } ) ).toEqual( {
			...initialState,
			fields: {
				[ key ]: {
					errors: [],
					isTouched: true,
					value,
				},
			},
		} );
	} );

	test( 'should return an object with field error', () => {
		const key = 'card';
		const message = 'generic error';
		const payload = { key, message };
		expect( reducer( undefined, { type: 'FIELD_ERROR_SET', payload } ) ).toEqual( {
			...initialState,
			fields: {
				[ key ]: {
					errors: [ message ],
					isTouched: true,
					value: '',
				},
			},
		} );
	} );

	test( 'should return an object by settting all the fields as touched', () => {
		const updatedState = {
			...initialState,
			fields: {
				card: {
					isTouched: false,
				},
				cvc: {
					isTouched: false,
				},
			},
		};
		const state = reducer( deepFreeze( updatedState ), {
			type: 'TOUCH_ALL_FIELDS',
		} );

		expect( state ).toEqual( {
			...initialState,
			fields: {
				card: {
					isTouched: true,
				},
				cvc: {
					isTouched: true,
				},
			},
		} );
	} );

	test( 'should return an object with card data complete set', () => {
		const type = 'cvc';
		const complete = true;
		const payload = { type, complete };
		expect( reducer( undefined, { type: 'CARD_DATA_COMPLETE_SET', payload } ) ).toEqual( {
			...initialState,
			cardDataComplete: {
				...initialState.cardDataComplete,
				[ type ]: complete,
			},
		} );
	} );

	test( 'should return an object with card data error set', () => {
		const type = 'cvc';
		const message = 'generic error';
		const payload = { type, message };
		expect( reducer( undefined, { type: 'CARD_DATA_ERROR_SET', payload } ) ).toEqual( {
			...initialState,
			cardDataErrors: {
				...initialState.cardDataErrors,
				[ type ]: message,
			},
		} );
	} );

	test( 'should return an object with use as primary method set', () => {
		const payload = false;
		expect( reducer( undefined, { type: 'USE_AS_PRIMARY_PAYMENT_METHOD', payload } ) ).toEqual( {
			...initialState,
			useAsPrimaryPaymentMethod: payload,
		} );
	} );
} );
