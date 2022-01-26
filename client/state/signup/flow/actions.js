import {
	SIGNUP_CURRENT_FLOW_NAME_SET,
	SIGNUP_PREVIOUS_FLOW_NAME_SET,
	SIGNUP_FLOW_ADD_EXCLUDE_STEPS,
	SIGNUP_FLOW_REMOVE_EXCLUDE_STEPS,
	SIGNUP_FLOW_RESET_EXCLUDE_STEPS,
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

export function addExcludeSteps( steps ) {
	return {
		type: SIGNUP_FLOW_ADD_EXCLUDE_STEPS,
		steps,
	};
}

export function removeExcludeSteps( steps ) {
	return {
		type: SIGNUP_FLOW_REMOVE_EXCLUDE_STEPS,
		steps,
	};
}

export function resetExcludeSteps() {
	return {
		type: SIGNUP_FLOW_RESET_EXCLUDE_STEPS,
	};
}
