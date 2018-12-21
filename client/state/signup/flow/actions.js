/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_CURRENT_FLOW_DETAILS_SET } from 'state/action-types';

export function setCurrentFlowDetails( { name, step } ) {
	return {
		type: SIGNUP_CURRENT_FLOW_DETAILS_SET,
		name,
		step,
	};
}
