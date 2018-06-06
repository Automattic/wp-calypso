/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';
export { getFluxDispatchToken } from './actions-compatibility';

export function updateDependencyStore( data ) {
	return {
		type: SIGNUP_DEPENDENCY_STORE_UPDATE,
		data,
	};
}

export function resetDependencyStore() {
	return {
		type: SIGNUP_COMPLETE_RESET,
		data: {},
	};
}
