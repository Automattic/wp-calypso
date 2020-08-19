/**
 * External dependencies
 */
import { useReducer, useMemo, useCallback, useContext, useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import { FormStatusManager, FormStatusController, ReactStandardAction } from '../types';

const debug = debugFactory( 'composite-checkout:form-status' );

export function useFormStatus(): FormStatusController {
	const { formStatus, setFormStatus } = useContext( CheckoutContext );
	const formStatusActions = useMemo(
		() => ( {
			setFormLoading: () => setFormStatus( 'loading' ),
			setFormReady: () => setFormStatus( 'ready' ),
			setFormSubmitting: () => setFormStatus( 'submitting' ),
			setFormValidating: () => setFormStatus( 'validating' ),
			setFormComplete: () => setFormStatus( 'complete' ),
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
		isLoading ? 'loading' : 'ready'
	);
	const setFormStatus = useCallback( ( payload ) => {
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

function formStatusReducer( state: string, action: ReactStandardAction ): string {
	switch ( action.type ) {
		case 'FORM_STATUS_CHANGE':
			validateStatus( action.payload );
			debug( 'setting form status to', action.payload );
			return action.payload;
		default:
			return state;
	}
}

function validateStatus( status: string ): void {
	const validStatuses = [ 'loading', 'ready', 'validating', 'submitting', 'complete' ];
	if ( ! validStatuses.includes( status ) ) {
		throw new Error( `Invalid form status '${ status }'` );
	}
}

function getNewStatusFromProps( {
	isLoading,
	isValidating,
}: {
	isLoading: boolean;
	isValidating: boolean;
} ): string {
	if ( isLoading ) {
		return 'loading';
	}
	if ( isValidating ) {
		return 'validating';
	}
	return 'ready';
}
