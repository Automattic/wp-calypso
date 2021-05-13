/**
 * External dependencies
 */
import { useReducer, useEffect, useRef } from 'react';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetAllowedPaymentMethods = () => wpcom.getAllowedPaymentMethods();

export default function useFetchAvailablePaymentMethods(): AvailablePaymentMethodsState {
	const isSubscribed = useRef< boolean >( true );
	const [ state, dispatch ] = useReducer( availablePaymentMethodsReducer, {
		error: undefined,
		isFetching: false,
		data: [],
	} );
	useEffect( () => {
		dispatch( { type: 'BEGIN' } );
		wpcomGetAllowedPaymentMethods()
			.then( ( paymentMethods: string[] ) => {
				isSubscribed.current && dispatch( { type: 'SUCCESS', payload: paymentMethods } );
			} )
			.catch( ( error: Error ) => {
				isSubscribed.current && dispatch( { type: 'ERROR', payload: error.message } );
			} );
		return () => {
			isSubscribed.current = false;
		};
	}, [] );
	return state;
}

export interface AvailablePaymentMethodsState {
	error: string | undefined;
	isFetching: boolean;
	data: string[];
}

interface AvailablePaymentMethodsBeginAction {
	type: 'BEGIN';
}

interface AvailablePaymentMethodsErrorAction {
	type: 'ERROR';
	payload: string;
}

interface AvailablePaymentMethodsSuccessAction {
	type: 'SUCCESS';
	payload: string[];
}

type AvailablePaymentMethodsAction =
	| AvailablePaymentMethodsBeginAction
	| AvailablePaymentMethodsErrorAction
	| AvailablePaymentMethodsSuccessAction;

function availablePaymentMethodsReducer(
	state: AvailablePaymentMethodsState,
	action: AvailablePaymentMethodsAction
): AvailablePaymentMethodsState {
	switch ( action.type ) {
		case 'BEGIN':
			return { ...state, error: undefined, data: [], isFetching: true };
		case 'ERROR':
			return { ...state, error: action.payload, data: [], isFetching: false };
		case 'SUCCESS':
			return { ...state, error: undefined, data: action.payload, isFetching: false };
		default:
			return state;
	}
}
