import { navigate } from 'calypso/lib/navigate';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Callback } from '@automattic/calypso-router';

/**
 * Redirect the legacy /settings/podcasting/<site> route to the in-admin
 * Podcast SPA at admin.php?page=jetpack-podcast. The new jetpack-podcast
 * package owns the experience post-untangle.
 */
export const createPodcastSettings: Callback = ( context ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const adminUrl = getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-podcast' );

	if ( adminUrl ) {
		navigate( adminUrl );
		return;
	}

	const siteSlug = getSelectedSiteSlug( state );
	navigate( siteSlug ? `/home/${ siteSlug }` : '/sites' );
};
