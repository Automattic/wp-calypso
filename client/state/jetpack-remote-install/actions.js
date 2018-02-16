/** @format */

/**
 * Internal dependencies
 */
import {
	JETPACK_REMOTE_INSTALL,
	JETPACK_REMOTE_INSTALL_FAILURE,
	JETPACK_REMOTE_INSTALL_SUCCESS,
} from 'state/action-types';

/**
 * Install the jetpack plugin on a remote .org site.
 *
 * @param {string} url - The remote site url
 * @param {string} user - username or email for remote site login
 * @param {string} password - password for remote site login
 * @return {Object} action object
 */
export const jetpackRemoteInstall = ( url, user, password ) => ( {
	type: JETPACK_REMOTE_INSTALL,
	url,
	user,
	password,
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
} );

/**
 * Update local state with an error received from remote jetpack
 * installation attempt.
 *
 * @param {string} url - remote site url
 * @param {string} errorCode - the error returned from the installation attempt
 * @return {Object} action object
 */
export const jetpackRemoteInstallUpdateError = ( url, errorCode ) => ( {
	type: JETPACK_REMOTE_INSTALL_FAILURE,
	url,
	errorCode,
} );

/**
 * Mark a jetpack remote installation complete in local state.
 *
 * @param {string} url - the remote site url
 * @return {Object} action object
 */
export const jetpackRemoteInstallComplete = url => ( {
	type: JETPACK_REMOTE_INSTALL_SUCCESS,
	url,
} );
