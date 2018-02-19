/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns any error that has resulted from requesting
 * a remote install of the jetpack plugin on the .org
 * site at the given url.
 *
 * @param {Object} state Global state tree
 * @param {String} url .org site URL
 * @return {?String} Error code, if any
 */
export default function getJetpackRemoteInstallError( state, url ) {
	return get( state.jetpackRemoteInstall.error, url, null );
}
