/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'state/action-types';

export const currentFlowName = ( state = '', { type, flowName } ) =>
	type === SIGNUP_CURRENT_FLOW_NAME_SET ? flowName : state;

export default combineReducers( {
	currentFlowName,
} );
