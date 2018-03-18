/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns success status of an attempted remote install
 * of the jetpack plugin to the .org site at the given url.
 *
 * @param {Object} state Global state tree
 * @param {String} url .org site URL
 * @return {bool} True if installation and activation was successful
 */
export default function isJetpackRemoteInstallComplete( state, url ) {
	return !! get( state.jetpackRemoteInstall.isComplete, url, false );
}
