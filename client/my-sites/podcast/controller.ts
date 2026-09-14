import { navigate } from 'calypso/lib/navigate';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Callback } from '@automattic/calypso-router';

/**
 * Redirect the in-progress /settings/podcast[/<section>]/<site> route to
 * the in-admin Podcast SPA at admin.php?page=jetpack-podcast. The section
 * (episodes|distribution|settings) maps to the SPA's `?tab=` deep link.
 */
export const createPodcast: Callback = ( context ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const { section } = context.params;
	const path = section
		? `admin.php?page=jetpack-podcast&tab=${ encodeURIComponent( section ) }`
		: 'admin.php?page=jetpack-podcast';
	const adminUrl = getSiteAdminUrl( state, siteId, path );

	if ( adminUrl ) {
		navigate( adminUrl );
		return;
	}

	const siteSlug = getSelectedSiteSlug( state );
	navigate( siteSlug ? `/home/${ siteSlug }` : '/sites' );
};
