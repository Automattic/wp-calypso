/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/signup/init';

export function getCurrentFlowName( state ) {
	return get( state, 'signup.flow.currentFlowName', '' );
}

export function getPreviousFlowName( state ) {
	return get( state, 'signup.flow.previousFlowName', '' );
}
