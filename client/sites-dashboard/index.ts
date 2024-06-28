import page from '@automattic/calypso-router';
import sitesDashboardV2 from 'calypso/sites-dashboard-v2';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';

export default function () {
	// Maintain old `/sites/:id` URLs by redirecting them to My Home
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = site?.ID;
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );

	sitesDashboardV2();
}
