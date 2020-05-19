/**
 * External dependencies
 */
import { useReducer, useMemo, useCallback, useContext, useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';

const debug = debugFactory( 'composite-checkout:form-status' );

export function useFormStatus() {
	const { formStatus, setFormStatus } = useContext( CheckoutContext );
	return useMemo(
		() => ( {
			formStatus,
			setFormLoading: () => setFormStatus( 'loading' ),
			setFormReady: () => setFormStatus( 'ready' ),
			setFormSubmitting: () => setFormStatus( 'submitting' ),
			setFormValidating: () => setFormStatus( 'validating' ),
			setFormComplete: () => setFormStatus( 'complete' ),
		} ),
		[ formStatus, setFormStatus ]
	);
}

export function useFormStatusManager( isLoading, isValidating ) {
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

function formStatusReducer( state, action ) {
	switch ( action.type ) {
		case 'FORM_STATUS_CHANGE':
			validateStatus( action.payload );
			debug( 'setting form status to', action.payload );
			return action.payload;
		default:
			return state;
	}
}

function validateStatus( status ) {
	const validStatuses = [ 'loading', 'ready', 'validating', 'submitting', 'complete' ];
	if ( ! validStatuses.includes( status ) ) {
		throw new Error( `Invalid form status '${ status }'` );
	}
}

function getNewStatusFromProps( { isLoading, isValidating } ) {
	if ( isLoading ) {
		return 'loading';
	}
	if ( isValidating ) {
		return 'validating';
	}
	return 'ready';
}
