/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error message that has resulted from requesting
 * a remote install of the jetpack plugin on the .org
 * site at the given url.
 *
 * @param {Object} state Global state tree
 * @param {String} url .org site URL
 * @return {?String} Error message, if any
 */
export default function getJetpackRemoteInstallErrorMessage( state, url ) {
	return get( state.jetpackRemoteInstall.errorMessage, url, null );
}
