/**
 * Internal dependencies
 */
import { ACTIVATE_SUPPORT_USER, DEACTIVATE_SUPPORT_USER } from 'state/action-types';

/**
 * Returns an action object to signal that the support user was activated.
 *
 * @return {Object}      Action object
 */
export function activateSupportUser() {
	console.log( 'activateSupportUser' );
	return {
		type: ACTIVATE_SUPPORT_USER
	};
}

/**
 * Returns an action object to signal that the support user was disabled.
 *
 * @return {Object}      Action object
 */
export function deactivateSupportUser() {
	console.log( 'deactivateSupportUser' );
	return {
		type: DEACTIVATE_SUPPORT_USER
	};
}
