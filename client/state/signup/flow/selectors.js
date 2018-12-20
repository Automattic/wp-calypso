/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function getcurrentFlowName( state ) {
	return get( state, 'signup.flow.currentFlowName', '' );
}
