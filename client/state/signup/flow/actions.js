import {
	SIGNUP_CURRENT_FLOW_NAME_SET,
	SIGNUP_PREVIOUS_FLOW_NAME_SET,
	SIGNUP_FLOW_ADD_EXCLUDED_STEPS,
	SIGNUP_FLOW_REMOVE_EXCLUDED_STEPS,
	SIGNUP_FLOW_RESET_EXCLUDED_STEPS,
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

export function addExcludedSteps( steps ) {
	return {
		type: SIGNUP_FLOW_ADD_EXCLUDED_STEPS,
		steps,
	};
}

export function removeExcludedSteps( steps ) {
	return {
		type: SIGNUP_FLOW_REMOVE_EXCLUDED_STEPS,
		steps,
	};
}

export function resetExcludedSteps() {
	return {
		type: SIGNUP_FLOW_RESET_EXCLUDED_STEPS,
	};
}
