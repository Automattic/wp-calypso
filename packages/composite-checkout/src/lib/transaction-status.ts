/**
 * External dependencies
 */
import { useCallback, useContext, useMemo, useReducer } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import {
	TransactionStatus,
	TransactionStatusState,
	TransactionStatusAction,
	TransactionStatusManager,
	TransactionStatusPayloads,
} from '../types';

const debug = debugFactory( 'composite-checkout:transaction-status' );

export function useTransactionStatus(): TransactionStatusManager {
	const { transactionStatusManager } = useContext( CheckoutContext );
	if ( ! transactionStatusManager ) {
		throw new Error( 'useTransactionStatus can only be called inside CheckoutProvider' );
	}
	return transactionStatusManager;
}

const initialState: TransactionStatusState = {
	previousTransactionStatus: TransactionStatus.NOT_STARTED,
	transactionStatus: TransactionStatus.NOT_STARTED,
	transactionError: null,
	transactionLastResponse: null,
	transactionRedirectUrl: null,
};

export function useTransactionStatusManager(): TransactionStatusManager {
	const [ state, dispatch ] = useReducer( transactionStatusReducer, initialState );
	const resetTransaction = useCallback< TransactionStatusManager[ 'resetTransaction' ] >( () => {
		debug( 'resetting transaction' );
		dispatch( {
			type: 'STATUS_SET',
			payload: { status: TransactionStatus.NOT_STARTED },
		} );
	}, [] );
	const setTransactionComplete = useCallback<
		TransactionStatusManager[ 'setTransactionComplete' ]
	>( ( response ) => {
		debug( 'setting transaction complete' );
		dispatch( {
			type: 'STATUS_SET',
			payload: { status: TransactionStatus.COMPLETE, response },
		} );
	}, [] );
	const setTransactionError = useCallback< TransactionStatusManager[ 'setTransactionError' ] >(
		( errorMessage ) => {
			debug( 'setting transaction as error' );
			dispatch( {
				type: 'STATUS_SET',
				payload: { status: TransactionStatus.ERROR, error: errorMessage },
			} );
		},
		[]
	);
	const setTransactionPending = useCallback<
		TransactionStatusManager[ 'setTransactionPending' ]
	>( () => {
		debug( 'setting transaction as pending' );
		dispatch( { type: 'STATUS_SET', payload: { status: TransactionStatus.PENDING } } );
	}, [] );
	const setTransactionRedirecting = useCallback<
		TransactionStatusManager[ 'setTransactionRedirecting' ]
	>( ( url ) => {
		debug( 'setting transaction as redirecting' );
		dispatch( {
			type: 'STATUS_SET',
			payload: { status: TransactionStatus.REDIRECTING, url },
		} );
	}, [] );

	const {
		transactionStatus,
		previousTransactionStatus,
		transactionLastResponse,
		transactionError,
		transactionRedirectUrl,
	}: TransactionStatusState = state;

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
		]
	);
}

function transactionStatusReducer(
	state: TransactionStatusState,
	action: TransactionStatusAction
): TransactionStatusState {
	switch ( action.type ) {
		case 'STATUS_SET': {
			const {
				status,
				response = null,
				error = null,
				url = null,
			} = action.payload as TransactionStatusPayloads;
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
