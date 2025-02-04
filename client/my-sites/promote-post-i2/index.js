import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { getSiteFragment } from 'calypso/lib/route';
import { navigation, redirectToPrimary, sites, siteSelection } from 'calypso/my-sites/controller';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
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

	const { getState, dispatch } = context.store;
	const primarySiteId = getPrimarySiteId( getState() );
	const primarySiteSlug = getSiteSlug( getState(), primarySiteId );

	if ( primarySiteSlug ) {
		redirectToPrimary( context, primarySiteSlug );
		return;
	}

	// Fetch the primary site by ID and then try to determine its slug again.
	dispatch( requestSite( primarySiteId ) )
		.catch( () => null )
		.then( () => {
			const freshPrimarySiteSlug = getSiteSlug( getState(), primarySiteId );
			if ( freshPrimarySiteSlug ) {
				redirectToPrimary( context, freshPrimarySiteSlug );
				return;
			}

			// no redirection happened, proceed to showing the sites list
			next();
		} );
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
		siteSelection,
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
