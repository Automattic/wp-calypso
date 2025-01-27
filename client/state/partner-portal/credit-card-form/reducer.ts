import { AnyAction, Reducer, UnknownAction } from 'redux';
import { maskField } from 'calypso/lib/checkout';
import { combineReducers } from 'calypso/state/utils';

const initialState = {
	fields: {},
	cardDataComplete: {
		card: false,
	},
	cardDataErrors: {},
	useAsPrimaryPaymentMethod: true,
};

interface FieldsStateValue {
	value: string;
	isTouched: boolean;
	errors: string[];
}
type FieldsState = Record< string, FieldsStateValue | undefined >;
type FieldsAction =
	| { type: 'FIELD_VALUE_SET'; payload: { key: string; value: string } }
	| { type: 'FIELD_ERROR_SET'; payload: { key: string; message: string } }
	| { type: 'TOUCH_ALL_FIELDS' };

function isFieldValueSetAction(
	action: FieldsAction | UnknownAction
): action is Extract< FieldsAction, { type: 'FIELD_VALUE_SET' } > {
	return action.type === 'FIELD_VALUE_SET';
}

function isFieldErrorSetAction(
	action: FieldsAction | UnknownAction
): action is Extract< FieldsAction, { type: 'FIELD_ERROR_SET' } > {
	return action.type === 'FIELD_ERROR_SET';
}

export function fields(
	state: FieldsState = initialState.fields,
	action: FieldsAction | UnknownAction
): FieldsState {
	if ( isFieldValueSetAction( action ) ) {
		return {
			...state,
			[ action.payload.key ]: {
				value: maskField(
					action.payload.key,
					state[ action.payload.key ]?.value ?? '',
					action.payload.value
				),
				isTouched: true, // mark whether the HTML input has been touched, so we only show errors if the input is touched and its value is not valid
				errors: [],
			},
		};
	}

	if ( isFieldErrorSetAction( action ) ) {
		return {
			...state,
			[ action.payload.key ]: {
				...( state[ action.payload.key ] ?? { value: '', isTouched: true } ),
				errors: [ action.payload.message ],
			},
		};
	}

	if ( action.type === 'TOUCH_ALL_FIELDS' ) {
		return Object.entries( state ).reduce( ( obj: FieldsState, [ key, value ] ) => {
			obj[ key ] = {
				...( value ?? { value: '', errors: [] } ),
				isTouched: true, // mark whether the HTML input has been touched, so we only show errors if the input is touched and its value is not valid
			};
			return obj;
		}, {} );
	}

	return state;
}

export const cardDataComplete: Reducer< Record< string, boolean >, AnyAction > = (
	state = initialState.cardDataComplete,
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
	state = initialState.cardDataErrors,
	action
) => {
	switch ( action?.type ) {
		case 'CARD_DATA_ERROR_SET':
			return { ...state, [ action.payload.type ]: action.payload.message };
		default:
			return state;
	}
};

export const useAsPrimaryPaymentMethod: Reducer< boolean, AnyAction > = (
	state = initialState.useAsPrimaryPaymentMethod,
	action
) => {
	switch ( action?.type ) {
		case 'USE_AS_PRIMARY_PAYMENT_METHOD':
			return action.payload;
		default:
			return state;
	}
};

const reducer = combineReducers( {
	fields,
	cardDataErrors,
	cardDataComplete,
	useAsPrimaryPaymentMethod,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
