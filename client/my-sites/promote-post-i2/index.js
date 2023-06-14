import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { promoteWidget, promotedPosts, campaignDetails } from './controller';
import { getAdvertisingDashboardPath } from './utils';

export const redirectToPrimarySite = ( context, next ) => {
	const siteFragment = context.params.site || getSiteFragment( context.path );

	if ( siteFragment ) {
		return next();
	}

	const state = context.store.getState();
	const primarySiteSlug = getPrimarySiteSlug( state );
	if ( primarySiteSlug !== null ) {
		page( getAdvertisingDashboardPath( `/${ primarySiteSlug }` ) );
	} else {
		siteSelection( context, next );
		page( getAdvertisingDashboardPath( '' ) );
	}
};

export default () => {
	page(
		getAdvertisingDashboardPath( '/' ),
		redirectToPrimarySite,
		sites,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/promote/:item?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promoteWidget,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/:tab?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/campaigns/:campaignId' ),
		redirectToPrimarySite,
		campaignDetails,
		navigation,
		makeLayout,
		clientRender
	);

	page(
		getAdvertisingDashboardPath( '/:site?/:tab?/promote/:item?' ),
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promoteWidget,
		makeLayout,
		clientRender
	);
};
