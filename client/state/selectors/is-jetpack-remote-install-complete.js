/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns success status of an attempted remote install
 * of the jetpack plugin to the .org site at the given url.
 *
 * @param {object} state Global state tree
 * @param {string} url .org site URL
 * @returns {bool} True if installation and activation was successful
 */
export default function isJetpackRemoteInstallComplete( state, url ) {
	return !! get( state.jetpackRemoteInstall.isComplete, url, false );
}
