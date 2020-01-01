/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error code that has resulted from requesting
 * a remote install of the jetpack plugin on the .org
 * site at the given url.
 *
 * @param {object} state Global state tree
 * @param {string} url .org site URL
 * @return {?String} Error code, if any
 */
export default function getJetpackRemoteInstallError( state, url ) {
	return get( state.jetpackRemoteInstall.errorCode, url, null );
}
