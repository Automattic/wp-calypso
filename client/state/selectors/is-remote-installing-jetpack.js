import 'calypso/state/jetpack-remote-install/init';

/**
 * Returns whether the remote installation of the jetpack plugin to the .org site
 * is currently in progress at the given url.
 *
 * @param {Object} state Global state tree
 * @param {string} url .org site URL
 * @returns {boolean} True if installation is currently in progress
 */
export default function isRemoteInstallingJetpack( state, url ) {
	return state.jetpackRemoteInstall.isRemoteInstallingJetpack[ url ] ?? false;
}
