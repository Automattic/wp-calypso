import {
	FEATURE_INSTALL_PLUGINS,
	FEATURE_PLUGINS_ALLOW_ONE,
	FEATURE_PLUGINS_ALLOW_THREE,
} from '@automattic/calypso-products';
import { getPlugins } from 'calypso/state/plugins/installed/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { Plugin } from 'calypso/state/plugins/installed/types';
import type { AppState } from 'calypso/types';

/**
 * Returns whether the user can install plugins on a specific site.
 * This takes into account both user permissions and site features.
 * @param {Object} state Global state tree
 * @param {number} siteId The site ID
 * @returns {boolean} Whether the user can install plugins on the site
 */
export default function canUserInstallPluginsOnSite(
	state: AppState,
	siteId: number | null | undefined
): boolean {
	// First check if user has permission to manage plugins
	if ( ! canCurrentUser( state, siteId, 'manage_options' ) ) {
		return false;
	}

	// Check if site has the basic plugin installation feature
	if ( ! siteHasFeature( state, siteId, FEATURE_INSTALL_PLUGINS ) ) {
		return false;
	}

	// Get currently installed and active plugins count
	const plugins = getPlugins( state, [ siteId ], 'active' ) as Plugin[];
	const activePluginsCount = plugins.length;

	// Check plugin count limits based on features
	if ( siteHasFeature( state, siteId, FEATURE_PLUGINS_ALLOW_ONE ) && activePluginsCount >= 1 ) {
		return false;
	}

	if ( siteHasFeature( state, siteId, FEATURE_PLUGINS_ALLOW_THREE ) && activePluginsCount >= 3 ) {
		return false;
	}

	return true;
}
