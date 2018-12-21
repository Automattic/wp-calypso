/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getCurrentFlowName( state ) {
	return get( state, 'signup.flow.name', '' );
}

export function getCurrentStepName( state ) {
	return get( state, 'signup.flow.step', '' );
}
