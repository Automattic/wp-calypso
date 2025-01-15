import page, { type Callback, type Context } from '@automattic/calypso-router';
import debugModule from 'debug';
import { dashboardPath } from 'calypso/lib/jetpack/paths';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import ManageSelectedSiteSidebar from '../sidebar-navigation/manage-selected-site';
import Landing from './main';
import { isSiteEligibleForJetpackCloud, getLandingPath } from './selectors';

const debug = debugModule( 'calypso:jetpack-cloud:landing:controller' );

const landForSiteId = ( siteId: number | null, context: Context, next: () => void ) => {
	debug( '[landForSiteId]: function entry', { siteId, context } );

	// Landing requires a site ID;
	// if we don't have one, redirect to the site selection page
	if ( ! Number.isInteger( siteId ) ) {
		debug( '[landForSiteId]: site ID not specified; redirecting to site selection' );
		return page.redirect( '/landing' );
	}

	const state = context.store.getState();

	// To land people on the right page, we need to have information
	// on the selected site's eligibility and the Cloud services available to it;
	// if this info isn't present, dip into an empty React page
	// that will fetch it and then redirect using the same logic
	const isEligible = isSiteEligibleForJetpackCloud( state, siteId as number );
	const siteFeatures = getFeaturesBySiteId( state, siteId );
	if ( isEligible === null || ! siteFeatures ) {
		debug( '[landForSiteId]: rendering interstitial Landing page' );

		// To make the UI feel seamless transition, we want to have the sidebar appear on the interstitial page
		context.secondary = <ManageSelectedSiteSidebar path={ context.path } />;
		context.primary = <Landing siteId={ siteId as number } />;
		next();
		return;
	}

	const landingPath = getLandingPath( state, siteId );
	debug( '[landForSiteId]: redirecting immediately', { landingPath } );
	page.redirect( landingPath );
};

export const landForPrimarySite: Callback = ( context, next ) => {
	debug( '[landForPrimarySite]: function entry', context );

	const state = context.store.getState();

	const isAgency = isAgencyUser( state );
	const dashboardRedirectLink = dashboardPath();
	if ( isAgency ) {
		debug( '[landForPrimarySite]: redirecting to agency dashboard' );

		page.redirect( dashboardRedirectLink );
		return;
	}

	const primarySiteId = getPrimarySiteId( state );
	landForSiteId( primarySiteId, context, next );
};

export const landForSelectedSite: Callback = ( context, next ) => {
	debug( '[landForSelectedSite]: function entry', context );

	const state = context.store.getState();
	const selectedSiteId = getSelectedSiteId( state );

	landForSiteId( selectedSiteId, context, next );
};
