import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { sanitizeQueryParameters, sitesDashboard } from './controller';

export default function () {
	// Maintain old `/sites/:id` URLs by redirecting them to My Home
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = site?.ID;
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );

	page( '/sites', sanitizeQueryParameters, sitesDashboard, makeLayout, clientRender );
}
