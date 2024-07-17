import page from '@automattic/calypso-router';
import { getSiteIdBySlug } from '@automattic/data-stores/src/site/selectors';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation } from 'calypso/my-sites/controller';
import { getSiteBySlug, getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
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
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		navigation,
		checkReferrerForSiteSelection,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}

function checkReferrerForSiteSelection( context, next ) {
	// this would change the selected site back to the referrer every time we load back to the dashboard.
	// we will likely need to manage this somehow, maybe setting and clearing an initial referrer in the store?
	const { referrer } = document;
	const referringSite = referrer && getSiteIdBySlug( context.store.getState(), referrer );
	if ( referringSite ) {
		context.store.dispatch( setSelectedSiteId( referringSite ) );
	}

	next();
}
