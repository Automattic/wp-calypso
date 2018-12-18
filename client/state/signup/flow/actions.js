/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_CURRENT_FLOW_SET } from 'state/action-types';

export function setCurrentFlow( flowName ) {
	return {
		type: SIGNUP_CURRENT_FLOW_SET,
		flowName,
	};
}
