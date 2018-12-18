/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { SIGNUP_CURRENT_FLOW_SET } from 'state/action-types';

export const currentFlow = ( state = '', { type, flowName } ) =>
	type === SIGNUP_CURRENT_FLOW_SET ? flowName : state;

export default combineReducers( {
	currentFlow,
} );
