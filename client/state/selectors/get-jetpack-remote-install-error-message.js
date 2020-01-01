/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error message that has resulted from requesting
 * a remote install of the jetpack plugin on the .org
 * site at the given url.
 *
 * @param {object} state Global state tree
 * @param {string} url .org site URL
 * @return {?string} Error message, if any
 */
export default function getJetpackRemoteInstallErrorMessage( state, url ) {
	return get( state.jetpackRemoteInstall.errorMessage, url, null );
}
