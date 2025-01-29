import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the site has capabilities to manage plugins
 */
export default function hasPluginCapabilities(
	state: AppState,
	siteId: number | undefined | null
): boolean {
	if ( ! siteId ) {
		return false;
	}

	const site = getRawSite( state, siteId );
	return !! ( site?.capabilities?.activate_plugins && site?.capabilities?.update_plugins );
}
