import debugFactory from 'debug';
import { useCallback, useMemo, useReducer } from 'react';
import {
	FormStatus,
	FormAndTransactionStatus,
	FormAndTransactionStatusAction,
	TransactionStatusPayloads,
	FormStatusSetter,
	FormAndTransactionStatusManager,
	TransactionStatusManager,
	TransactionStatusState,
	TransactionStatus,
} from '../types';

const debug = debugFactory( 'composite-checkout:form-and-transaction-status' );

/**
 * A React hook to create the context required by the `FormAndTransactionProvider`.
 *
 * The state can be accessed with `useFormStatus` and `useTransactionStatus`.
 *
 */
export function useFormAndTransactionStatusManager(): FormAndTransactionStatusManager {
	const initialState: FormAndTransactionStatus = {
		formStatus: FormStatus.LOADING,
		transactionStatus: {
			transactionStatus: TransactionStatus.NOT_STARTED,
			previousTransactionStatus: TransactionStatus.NOT_STARTED,
			transactionError: null,
			transactionLastResponse: null,
			transactionRedirectUrl: null,
		},
	};

	const [ formAndTransactionStatus, dispatchStatusChange ] = useReducer(
		formAndTransactionStatusReducer,
		initialState
	);

	const setFormStatus = useCallback< FormStatusSetter >( ( payload ) => {
		return dispatchStatusChange( { type: 'FORM_STATUS_CHANGE', payload } );
	}, [] );

	debug( `form status is ${ formAndTransactionStatus }` );

	const resetTransaction = useCallback< TransactionStatusManager[ 'resetTransaction' ] >( () => {
		debug( 'resetting transaction' );
		dispatchStatusChange( {
			type: 'TRANSACTION_STATUS_CHANGE',
			payload: { status: TransactionStatus.NOT_STARTED },
		} );
	}, [] );
	const setTransactionComplete = useCallback<
		TransactionStatusManager[ 'setTransactionComplete' ]
	>( ( response ) => {
		debug( 'setting transaction complete' );
		dispatchStatusChange( {
			type: 'TRANSACTION_STATUS_CHANGE',
			payload: { status: TransactionStatus.COMPLETE, response },
		} );
	}, [] );
	const setTransactionError = useCallback< TransactionStatusManager[ 'setTransactionError' ] >(
		( errorMessage ) => {
			debug( 'setting transaction as error' );
			dispatchStatusChange( {
				type: 'TRANSACTION_STATUS_CHANGE',
				payload: { status: TransactionStatus.ERROR, error: errorMessage },
			} );
		},
		[]
	);
	const setTransactionPending = useCallback<
		TransactionStatusManager[ 'setTransactionPending' ]
	>( () => {
		debug( 'setting transaction as pending' );
		dispatchStatusChange( {
			type: 'TRANSACTION_STATUS_CHANGE',
			payload: { status: TransactionStatus.PENDING },
		} );
	}, [] );
	const setTransactionRedirecting = useCallback<
		TransactionStatusManager[ 'setTransactionRedirecting' ]
	>( ( url ) => {
		debug( 'setting transaction as redirecting' );
		dispatchStatusChange( {
			type: 'TRANSACTION_STATUS_CHANGE',
			payload: { status: TransactionStatus.REDIRECTING, url },
		} );
	}, [] );

	const {
		transactionStatus,
		previousTransactionStatus,
		transactionLastResponse,
		transactionError,
		transactionRedirectUrl,
	}: TransactionStatusState = formAndTransactionStatus.transactionStatus;

	return useMemo(
		() => ( {
			formStatus: formAndTransactionStatus.formStatus,
			setFormStatus,
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
			formAndTransactionStatus.formStatus,
			setFormStatus,
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

function formAndTransactionStatusReducer(
	state: FormAndTransactionStatus,
	action: FormAndTransactionStatusAction
): FormAndTransactionStatus {
	switch ( action.type ) {
		case 'FORM_STATUS_CHANGE':
			validateFormStatus( action.payload );
			debug( 'setting form status to', action.payload );
			return { ...state, formStatus: action.payload };

		case 'TRANSACTION_STATUS_CHANGE': {
			const {
				status: newTransactionStatus,
				response = null,
				error = null,
				url = null,
			} = action.payload as TransactionStatusPayloads;

			const newFormStatus = ( () => {
				if ( newTransactionStatus === TransactionStatus.PENDING ) {
					return FormStatus.SUBMITTING;
				}
				if ( newTransactionStatus === TransactionStatus.COMPLETE ) {
					return FormStatus.COMPLETE;
				}
				if ( newTransactionStatus === TransactionStatus.NOT_STARTED ) {
					return FormStatus.READY;
				}
				return state.formStatus;
			} )();

			return {
				...state,
				formStatus: newFormStatus,
				transactionStatus: {
					...state.transactionStatus,
					previousTransactionStatus: state.transactionStatus.transactionStatus,
					transactionStatus: newTransactionStatus,
					transactionLastResponse: response,
					transactionRedirectUrl: url,
					transactionError: error,
				},
			};
		}

		default:
			return state;
	}
}

function validateFormStatus( status: unknown ): asserts status is FormStatus {
	if ( ! Object.values( FormStatus ).includes( status as never ) ) {
		throw new Error( `Invalid form status '${ status }'` );
	}
}
