import { getJetpackVersion as getVersion } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Returns the site object for the currently selected site.
 */
export default function getJetpackVersion( state: AppState ): string | undefined {
	// Try the Calypso way first
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return undefined;
	}
	const versionFromCalypso = getVersion( state, siteId );
	if ( versionFromCalypso ) {
		return versionFromCalypso;
	}

	// For BlazePress App that is used in Jetpack, try to the value from the config.
	return state?.ui?.jetpackVersion ?? undefined;
}
