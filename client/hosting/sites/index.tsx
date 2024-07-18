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
		sitesDashboard,
		makeLayout,
		checkReferrerForSiteSelection,
		clientRender
	);
}

function checkReferrerForSiteSelection( context, next ) {
	const { referrer } = document;
	// Only evluate this on initialization. Note im not 100% sure if this init value is fully
	// accurate for what we want, but on initial inspection it seems promising.
	if ( ! context.init || ! referrer ) {
		next();
		return;
	}

	const potentialSiteSlug = new URL( referrer ).hostname || '';
	const referringSiteId = getSiteIdBySlug( context.store.getState(), potentialSiteSlug );
	if ( referringSiteId ) {
		context.store.dispatch( setSelectedSiteId( referringSiteId ) );
	}

	next();
}
