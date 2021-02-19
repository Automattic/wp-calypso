/**
 * Internal dependencies
 */
import { SIGNUP_DEPENDENCY_STORE_UPDATE, SIGNUP_COMPLETE_RESET } from 'calypso/state/action-types';

import 'calypso/state/signup/init';

export function updateDependencies( dependencies ) {
	return { type: SIGNUP_DEPENDENCY_STORE_UPDATE, dependencies };
}

export function resetSignup() {
	return { type: SIGNUP_COMPLETE_RESET };
}
