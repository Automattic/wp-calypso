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
	previousTransactionStatus: 'not-started', // string
	transactionStatus: 'not-started', // string
	transactionError: null, // string | null
	transactionLastResponse: null, // object | null
	transactionRedirectUrl: null, // string | null
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
		( url ) =>
			dispatch( { type: 'STATUS_SET', payload: { status: 'redirecting', response: null, url } } ),
		[]
	);
	const setTransactionAuthorizing = useCallback(
		( response ) =>
			dispatch( { type: 'STATUS_SET', payload: { status: 'authorizing', response } } ),
		[]
	);

	const {
		transactionStatus,
		previousTransactionStatus,
		transactionLastResponse,
		transactionError,
		transactionRedirectUrl,
	} = state;

	return useMemo(
		() => ( {
			transactionStatus,
			previousTransactionStatus,
			transactionError,
			transactionLastResponse,
			transactionRedirectUrl,
			resetTransaction,
			setTransactionError,
			setTransactionComplete,
			setTransactionPending,
			setTransactionRedirecting,
			setTransactionAuthorizing,
		} ),
		[
			transactionStatus,
			previousTransactionStatus,
			transactionError,
			transactionLastResponse,
			transactionRedirectUrl,
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
			const { status, response, error, url } = action.payload;
			return {
				...state,
				previousTransactionStatus: state.transactionStatus,
				transactionStatus: status,
				transactionLastResponse: response,
				transactionRedirectUrl: url,
				transactionError: error,
			};
		}
	}
	return state;
}
