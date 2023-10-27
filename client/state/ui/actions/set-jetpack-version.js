import { JETPACK_VERSION_SET } from 'calypso/state/action-types';

/**
 * Returns an action object to be used in storing current Jetpack version.
 * @param {string | undefined} version Jetpack version Id
 * @returns {{type: string, version: string}} Action object
 */
export function setJetpackVersion( version ) {
	return {
		type: JETPACK_VERSION_SET,
		version,
	};
}
