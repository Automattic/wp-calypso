import debugFactory from 'debug';
import { useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import {
	FormStatus,
	FormStatusAction,
	FormStatusController,
	FormStatusManager,
	FormStatusSetter,
} from '../types';
import { FormStatusContext } from './form-status-context';

const debug = debugFactory( 'composite-checkout:form-status' );

export function useFormStatus(): FormStatusController {
	const { formStatus, setFormStatus } = useContext( FormStatusContext );
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

/**
 * A React hook to create the context required by the `FormStatusProvider`.
 *
 * The state can be accessed with `useFormStatus` and will always be in one of
 * the following states:
 *
 * - `FormStatus.LOADING`
 * - `FormStatus.READY`
 * - `FormStatus.VALIDATING`
 * - `FormStatus.SUBMITTING`
 * - `FormStatus.COMPLETE`
 *
 * You can change the current form status by using the `setFormStatus` function
 * returned by the `useFormStatus` hook.
 *
 * For the `LOADING` and `VALIDATING` states, you can also optionally set the
 * `isLoading` and `isValidating` arguments to this hook, respectively. These
 * are provided so that the form's initial state can be set more easily.
 */
export function useFormStatusManager(
	/**
	 * If true, this will set the current form status to LOADING without
	 * needing to call `setFormStatus`.
	 *
	 * This will take priority over the `isValidating` prop if both are set.
	 */
	isLoading: boolean,

	/**
	 * If true, this will set the current form status to VALIDATING without
	 * needing to call `setFormStatus`.
	 *
	 * The `isLoading` prop will take priority over this if both are set.
	 */
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
	return { formStatus, setFormStatus };
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
