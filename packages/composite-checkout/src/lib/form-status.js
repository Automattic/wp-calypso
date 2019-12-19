/**
 * External dependencies
 */
import { useReducer, useCallback, useContext, useEffect } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';

const debug = debugFactory( 'composite-checkout:form-status' );

export function useFormStatus() {
	const { formStatus, setFormStatus } = useContext( CheckoutContext );
	return [ formStatus, setFormStatus ];
}

export function useFormStatusManager( isLoading ) {
	const [ formStatus, dispatchFormStatus ] = useReducer(
		formStatusReducer,
		isLoading ? 'loading' : 'ready'
	);
	const setFormStatus = useCallback( payload => {
		if ( typeof payload === 'function' ) {
			return dispatchFormStatus( { type: 'FORM_STATUS_CHANGE_WITH_FUNCTION', payload } );
		}
		return dispatchFormStatus( { type: 'FORM_STATUS_CHANGE', payload } );
	}, [] );
	useEffect( () => {
		const newStatus = isLoading ? 'loading' : 'ready';
		debug( `isLoading has changed to ${ isLoading }; setting form status to ${ newStatus }` );
		setFormStatus( newStatus );
	}, [ isLoading, setFormStatus ] );
	debug( `form status is ${ formStatus }` );
	return [ formStatus, setFormStatus ];
}

function formStatusReducer( state, action ) {
	switch ( action.type ) {
		case 'FORM_STATUS_CHANGE':
			validateStatus( action.payload );
			debug( 'setting form status to', action.payload );
			return action.payload;
		case 'FORM_STATUS_CHANGE_WITH_FUNCTION': {
			const newStatus = action.payload( state );
			validateStatus( newStatus );
			debug( 'setting form status to', newStatus );
			return newStatus;
		}
		default:
			return state;
	}
}

function validateStatus( status ) {
	const validStatuses = [ 'loading', 'ready', 'submitting', 'complete' ];
	if ( ! validStatuses.includes( status ) ) {
		throw new Error( `Invalid form status '${ status }'` );
	}
}
