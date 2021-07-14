/**
 * External dependencies
 */
import { AnyAction, Reducer } from 'redux';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import { maskField } from 'calypso/lib/checkout';

export const fields: Reducer< Record< string, unknown >, AnyAction > = ( state = {}, action ) => {
	switch ( action?.type ) {
		case 'FIELD_VALUE_SET':
			return {
				...state,
				[ action.payload.key ]: {
					value: maskField( action.payload.key, state[ action.payload.key ], action.payload.value ),
					isTouched: true,
					errors: [],
				},
			};
		case 'FIELD_ERROR_SET': {
			return {
				...state,
				[ action.payload.key ]: {
					...state[ action.payload.key ],
					errors: [ action.payload.message ],
				},
			};
		}
		case 'TOUCH_ALL_FIELDS': {
			return Object.entries( state ).reduce( ( obj, [ key, value ] ) => {
				obj[ key ] = {
					value: value.value,
					isTouched: true,
				};
				return obj;
			}, {} );
		}
		default:
			return state;
	}
};

export const cardDataComplete: Reducer< Record< string, boolean >, AnyAction > = (
	state = {
		cardNumber: false,
		cardCvc: false,
		cardExpiry: false,
	},
	action
) => {
	switch ( action?.type ) {
		case 'CARD_DATA_COMPLETE_SET':
			return { ...state, [ action.payload.type ]: action.payload.complete };
		default:
			return state;
	}
};

export const cardDataErrors: Reducer< Record< string, unknown >, AnyAction > = (
	state = {},
	action
) => {
	switch ( action?.type ) {
		case 'CARD_DATA_ERROR_SET':
			return { ...state, [ action.payload.type ]: action.payload.message };
		default:
			return state;
	}
};

export const brand: Reducer< Record< string, unknown >, AnyAction > = ( state = {}, action ) => {
	switch ( action?.type ) {
		case 'BRAND_SET':
			return action.payload;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	fields,
	cardDataErrors,
	cardDataComplete,
	brand,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
