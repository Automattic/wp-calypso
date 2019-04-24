/**
 * Internal dependencies
 */
import { SIGNUP_DEPENDENCY_STORE_UPDATE, SIGNUP_COMPLETE_RESET } from 'state/action-types';

export function updateDependencies( providedDependencies ) {
	return { type: SIGNUP_DEPENDENCY_STORE_UPDATE, providedDependencies };
}

export function resetSignup() {
	return { type: SIGNUP_COMPLETE_RESET };
}
