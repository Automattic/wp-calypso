/**
 * External dependencies
 */
import { useMemo, useContext, useCallback, useReducer } from 'react';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { TransactionStatus, TransactionStatusAction, TransactionStatusManager } from '../types';

export function useTransactionStatus(): TransactionStatusManager {
	const { transactionStatusManager } = useContext( CheckoutContext );
	return transactionStatusManager;
}

const initialState: TransactionStatus = {
	previousTransactionStatus: 'not-started',
	transactionStatus: 'not-started',
	transactionError: null,
	transactionLastResponse: null,
	transactionRedirectUrl: null,
};

export function useTransactionStatusManager(): TransactionStatusManager {
	const [ state, dispatch ] = useReducer( transactionStatusReducer, initialState );
	const resetTransaction = useCallback(
		() =>
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: 'not-started' },
			} as TransactionStatusAction ),
		[]
	);
	const setTransactionComplete = useCallback(
		( response ) =>
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: 'complete', response },
			} as TransactionStatusAction ),
		[]
	);
	const setTransactionError = useCallback(
		( errorMessage ) =>
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: 'error', error: errorMessage },
			} as TransactionStatusAction ),
		[]
	);
	const setTransactionPending = useCallback(
		() =>
			dispatch( { type: 'STATUS_SET', payload: { status: 'pending' } } as TransactionStatusAction ),
		[]
	);
	const setTransactionRedirecting = useCallback(
		( url ) =>
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: 'redirecting', response: null, url },
			} as TransactionStatusAction ),
		[]
	);
	const setTransactionAuthorizing = useCallback(
		( response ) =>
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: 'authorizing', response },
			} as TransactionStatusAction ),
		[]
	);

	const {
		transactionStatus,
		previousTransactionStatus,
		transactionLastResponse,
		transactionError,
		transactionRedirectUrl,
	}: TransactionStatus = state;

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

function transactionStatusReducer(
	state: TransactionStatus,
	action: TransactionStatusAction
): TransactionStatus {
	switch ( action.type ) {
		case 'STATUS_SET': {
			const { status, response, error = null, url = null } = action.payload;
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
