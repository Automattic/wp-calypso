/**
 * External dependencies
 */

import { isFunction, isObject } from 'lodash';

/**
 * Dispatch an action or function with additional properties.
 *
 * If the action is an object, it adds props as properties to the action.
 * If the action is a function, it passes them to the function in the form
 * of func( dispatch, getState, props )
 * Additionally, if the function returns either an action object or another
 * function, it is recursively dispatched in the same manner.
 *
 * @param {Function} dispatch The dispatch function (same as in an action thunk)
 * @param {Function} getState Gets the current state (same as in an action thunk)
 * @param {object|Function} action The action to be dispatched
 * @param {object} props The props to be sent to the function or assigned to the object.
 */
export function dispatchWithProps( dispatch, getState, action, props ) {
	if ( isFunction( action ) ) {
		const returnValue = action( dispatch, getState, props );
		dispatchWithProps( dispatch, getState, returnValue, props );
	} else if ( isObject( action ) ) {
		dispatch( { ...action, ...props } );
	}
}
