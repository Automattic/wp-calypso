/**
 * External dependencies
 */
import { useMemo, useContext, useCallback, useReducer } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';

export function useTransactionStatus() {
	const { transactionStatusManager } = useContext( CheckoutContext );
	return transactionStatusManager;
}

const initialState = {
	transactionStatus: 'not-started', // string
	transactionError: null, // string | null
	transactionLastResponse: null, // object | null
};

export function useTransactionStatusManager() {
	const [ state, dispatch ] = useReducer( transactionStatusReducer, initialState );
	const resetTransaction = useCallback(
		() => dispatch( { type: 'STATUS_SET', payload: { status: 'not-started' } } ),
		[]
	);
	const setTransactionComplete = useCallback(
		( response ) => dispatch( { type: 'STATUS_SET', payload: { status: 'complete', response } } ),
		[]
	);
	const setTransactionError = useCallback(
		( errorMessage ) =>
			dispatch( { type: 'STATUS_SET', payload: { status: 'error', error: errorMessage } } ),
		[]
	);
	const setTransactionPending = useCallback(
		() => dispatch( { type: 'STATUS_SET', payload: { status: 'pending' } } ),
		[]
	);
	const setTransactionRedirecting = useCallback(
		() => dispatch( { type: 'STATUS_SET', payload: { status: 'redirecting' } } ),
		[]
	);
	const setTransactionAuthorizing = useCallback(
		() => dispatch( { type: 'STATUS_SET', payload: { status: 'authorizing' } } ),
		[]
	);

	const { transactionStatus, transactionLastResponse, transactionError } = state;

	return useMemo(
		() => ( {
			transactionStatus,
			transactionError,
			transactionLastResponse,
			resetTransaction,
			setTransactionError,
			setTransactionComplete,
			setTransactionPending,
			setTransactionRedirecting,
			setTransactionAuthorizing,
		} ),
		[
			transactionStatus,
			transactionError,
			transactionLastResponse,
			resetTransaction,
			setTransactionError,
			setTransactionComplete,
			setTransactionPending,
			setTransactionRedirecting,
			setTransactionAuthorizing,
		]
	);
}

function transactionStatusReducer( state, action ) {
	switch ( action.type ) {
		case 'STATUS_SET': {
			const { status, response, error } = action.payload;
			return {
				...state,
				transactionStatus: status,
				transactionResponse: response,
				transactionError: error,
			};
		}
	}
	return state;
}
