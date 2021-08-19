/**
 * Internal dependencies
 */
import {
	SIGNUP_CURRENT_FLOW_NAME_SET,
	SIGNUP_PREVIOUS_FLOW_NAME_SET,
	SIGNUP_EXCLUDE_STEP_SET,
} from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function setCurrentFlowName( flowName ) {
	return {
		type: SIGNUP_CURRENT_FLOW_NAME_SET,
		flowName,
	};
}

export function setPreviousFlowName( flowName ) {
	return {
		type: SIGNUP_PREVIOUS_FLOW_NAME_SET,
		flowName,
	};
}

export function setExcludeSteps( stepName ) {
	return {
		type: SIGNUP_EXCLUDE_STEP_SET,
		stepName,
	};
}
