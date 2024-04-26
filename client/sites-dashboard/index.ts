import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import gotoSitesDashBoardV2 from 'calypso/sites-dashboard-v2';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
	sitesDashboard,
} from './controller';

export default function () {
	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		gotoSitesDashBoardV2();
		return;
	}

	// Maintain old `/sites/:id` URLs by redirecting them to My Home
	page( '/sites/:site', ( context ) => {
		const state = context.store.getState();
		const site = getSiteBySlug( state, context.params.site );
		// The site may not be loaded into state yet.
		const siteId = site?.ID;
		page.redirect( getSiteHomeUrl( state, siteId ) );
	} );

	page(
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
