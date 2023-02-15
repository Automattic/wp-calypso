import config from '@automattic/calypso-config';
import Debug from 'debug';
import page from 'page';
import { dashboardPath } from 'calypso/lib/jetpack/paths';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getPrimarySiteIsJetpack from 'calypso/state/selectors/get-primary-site-is-jetpack';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import Landing from './main';
import { isSiteEligibleForJetpackCloud, getLandingPath } from './selectors';

const debug = new Debug( 'calypso:jetpack-cloud:landing:controller' );

const landForSiteId = ( siteId, context, next ) => {
	debug( '[landForSiteId]: function entry', { siteId, context } );

	const state = context.store.getState();

	// This path requires a selected site ID;
	// if we don't have one, go to the main landing page
	if ( ! Number.isFinite( siteId ) ) {
		page.redirect( '/landing' );
		return;
	}

	// To land people on the right page, we need to have information
	// on the selected site's eligibility and the Cloud services available to it;
	// if this info isn't present, dip into an empty React page
	// that will fetch it and then redirect using the same logic
	const isEligible = isSiteEligibleForJetpackCloud( state, siteId );
	const siteFeatures = getFeaturesBySiteId( state, siteId );
	if ( isEligible === null || ! siteFeatures ) {
		debug( '[landForSiteId]: rendering interstitial Landing page' );
		context.primary = <Landing siteId={ siteId } />;
		next();
		return;
	}

	const landingPath = getLandingPath( state, siteId );
	debug( '[landForSiteId]: redirecting immediately', { landingPath } );
	page.redirect( landingPath );
};

export const landForPrimarySite = ( context, next ) => {
	debug( '[landForPrimarySite]: function entry', context );

	const state = context.store.getState();

	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	const dashboardRedirectLink = dashboardPath();
	if ( isAgency && isAgencyEnabled ) {
		debug( '[landForPrimarySite]: redirecting to agency dashboard' );

		page.redirect( dashboardRedirectLink );
		return;
	}

	const isPrimarySiteJetpackSite = getPrimarySiteIsJetpack( state );
	if ( isPrimarySiteJetpackSite ) {
		const primarySiteId = getPrimarySiteId( state );
		landForSiteId( primarySiteId, context, next );
		return;
	}

	debug( '[landForPrimarySite]: redirecting to site selection' );
	page( `/landing` );
	next();
};

export const landForSelectedSite = ( context, next ) => {
	debug( '[landForSelectedSite]: function entry', context );

	const state = context.store.getState();
	const selectedSiteId = getSelectedSiteId( state );

	landForSiteId( selectedSiteId, context, next );
};
