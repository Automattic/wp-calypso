/**
 * External dependencies
 */

import { get } from 'lodash';

export function getCurrentFlowName( state ) {
	return get( state, 'signup.flow.currentFlowName', '' );
}
