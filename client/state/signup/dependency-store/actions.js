/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';

export function updateDependencies( dependencies ) {
	return { type: SIGNUP_DEPENDENCY_STORE_UPDATE, dependencies };
}

export function resetDependencies() {
	return { type: SIGNUP_COMPLETE_RESET };
}
