/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';

export function updateDependencyStore( data ) {
	return { type: SIGNUP_DEPENDENCY_STORE_UPDATE, data };
}
