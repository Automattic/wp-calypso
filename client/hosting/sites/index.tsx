import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, setSelectedSiteIdByOrigin } from 'calypso/controller';
import { navigation } from 'calypso/my-sites/controller';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
	sitesDashboard,
} from './controller';

export default function () {
	// Maintain old `/sites/:id` URLs by redirecting them to My Home
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = site?.ID;
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );

	page(
		'/p2s',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		navigation,
		setSelectedSiteIdByOrigin,
		sitesDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		navigation,
		setSelectedSiteIdByOrigin,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
