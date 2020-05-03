/**
 * Internal dependencies
 */
import { SIGNUP_CURRENT_FLOW_NAME_SET } from 'state/action-types';

import 'state/signup/init';

export function setCurrentFlowName( flowName ) {
	return {
		type: SIGNUP_CURRENT_FLOW_NAME_SET,
		flowName,
	};
}
