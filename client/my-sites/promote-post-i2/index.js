import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, sites, siteSelection } from 'calypso/my-sites/controller';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import {
	promoteWidget,
	promotedPosts,
	campaignDetails,
	checkValidTabInNavigation,
} from './controller';
import { getAdvertisingDashboardPath } from './utils';

export const redirectToPrimarySite = ( context, next ) => {
	const siteFragment = context.params.site || getSiteFragment( context.path );

	if ( siteFragment ) {
		return next();
	}

	const state = context.store.getState();
	const primarySiteSlug = getPrimarySiteSlug( state );
	if ( primarySiteSlug !== null ) {
		page( `${ context.pathname }/${ primarySiteSlug }` );
	} else {
		siteSelection( context, next );
		page( getAdvertisingDashboardPath( '' ) );
	}
};

const promotePage = ( url, controller ) => {
	page(
		url,
		redirectToPrimarySite,
		siteSelection,
		navigation,
		controller,
		makeLayout,
		clientRender
	);
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
		getAdvertisingDashboardPath( '/:tab?/:site?' ),
		checkValidTabInNavigation,
		redirectToPrimarySite,
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);

	promotePage( getAdvertisingDashboardPath( '/campaigns/:campaignId/:site?' ), campaignDetails );

	promotePage( getAdvertisingDashboardPath( '/promote/:item?/:site?' ), promoteWidget );

	promotePage( getAdvertisingDashboardPath( '/:tab?/promote/:item?/:site?' ), promoteWidget );
};
