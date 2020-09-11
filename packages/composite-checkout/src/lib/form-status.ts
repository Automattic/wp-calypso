/**
 * External dependencies
 */
import { useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import {
	FormStatus,
	FormStatusAction,
	FormStatusController,
	FormStatusManager,
	FormStatusSetter,
} from '../types';

const debug = debugFactory( 'composite-checkout:form-status' );

export function useFormStatus(): FormStatusController {
	const { formStatus, setFormStatus } = useContext( CheckoutContext );
	const formStatusActions = useMemo(
		() => ( {
			setFormLoading: () => setFormStatus( FormStatus.LOADING ),
			setFormReady: () => setFormStatus( FormStatus.READY ),
			setFormSubmitting: () => setFormStatus( FormStatus.SUBMITTING ),
			setFormValidating: () => setFormStatus( FormStatus.VALIDATING ),
			setFormComplete: () => setFormStatus( FormStatus.COMPLETE ),
		} ),
		[ setFormStatus ]
	);
	return useMemo(
		() => ( {
			...formStatusActions,
			formStatus,
		} ),
		[ formStatus, formStatusActions ]
	);
}

export function useFormStatusManager(
	isLoading: boolean,
	isValidating: boolean
): FormStatusManager {
	const [ formStatus, dispatchFormStatus ] = useReducer(
		formStatusReducer,
		isLoading ? FormStatus.LOADING : FormStatus.READY
	);
	const setFormStatus = useCallback< FormStatusSetter >( ( payload ) => {
		return dispatchFormStatus( { type: 'FORM_STATUS_CHANGE', payload } );
	}, [] );

	useEffect( () => {
		const newStatus = getNewStatusFromProps( { isLoading, isValidating } );
		debug( `props have changed; setting form status to ${ newStatus }` );
		setFormStatus( newStatus );
	}, [ isLoading, isValidating, setFormStatus ] );

	debug( `form status is ${ formStatus }` );
	return [ formStatus, setFormStatus ];
}

function formStatusReducer( state: FormStatus, action: FormStatusAction ): FormStatus {
	switch ( action.type ) {
		case 'FORM_STATUS_CHANGE':
			validateFormStatus( action.payload );
			debug( 'setting form status to', action.payload );
			return action.payload;
		default:
			return state;
	}
}

function validateFormStatus( status: unknown ): asserts status is FormStatus {
	if ( ! Object.values( FormStatus ).includes( status as never ) ) {
		throw new Error( `Invalid form status '${ status }'` );
	}
}

function getNewStatusFromProps( {
	isLoading,
	isValidating,
}: {
	isLoading: boolean;
	isValidating: boolean;
} ): FormStatus {
	if ( isLoading ) {
		return FormStatus.LOADING;
	}
	if ( isValidating ) {
		return FormStatus.VALIDATING;
	}
	return FormStatus.READY;
}
