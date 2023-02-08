import config from '@automattic/calypso-config';
import Debug from 'debug';
import { translate } from 'i18n-calypso';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { dashboardPath } from 'calypso/lib/jetpack/paths';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import getPrimarySiteIsJetpack from 'calypso/state/selectors/get-primary-site-is-jetpack';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import Landing from './sections/landing/main';
import { isSiteEligibleForJetpackCloud, getLandingPath } from './sections/landing/selectors';

const debug = new Debug( 'calypso:jetpack-cloud:controller' );

const selectionPrompt = ( context, next ) => {
	debug( 'controller: selectionPrompt', context );
	context.getSiteSelectionHeaderText = () =>
		// When "text-transform: capitalize;" is active,
		// (see rule for "".sites__select-heading strong")
		// Jetpack.com displays as Jetpack.Com in some browsers (e.g., Chrome)
		translate( 'Select a site to open {{strong}}Jetpack.com{{/strong}}', {
			components: { strong: <strong style={ { textTransform: 'none' } } /> },
		} );
	next();
};

const clearPageTitle = ( context, next ) => {
	context.clearPageTitle = true;
	next();
};

const redirectToPrimarySiteLanding = ( context, next ) => {
	debug( 'controller: redirectToPrimarySiteLanding', context );
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );
	const isPrimarySiteJetpackSite = getPrimarySiteIsJetpack( state );
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	const dashboardRedirectLink = dashboardPath();

	if ( isAgency && isAgencyEnabled ) {
		page.redirect( dashboardRedirectLink );
		return;
	}

	isPrimarySiteJetpackSite
		? page( `/landing/${ currentUser.primarySiteSlug }` )
		: page( `/landing` );

	next();
};

const landingController = ( context, next ) => {
	debug( 'controller: landingController', context );

	const state = context.store.getState();
	const selectedSiteId = getSelectedSiteId( state );

	// This path requires a selected site ID;
	// if we don't have one, go to the main landing page
	if ( ! Number.isFinite( selectedSiteId ) ) {
		page.redirect( '/landing' );
		return;
	}

	// To land people on the right page, we need to have information
	// on the selected site's eligibility and the Cloud services available to it;
	// if this info isn't present, dip into an empty React page
	// that will fetch it and then redirect using the same logic
	const isEligible = isSiteEligibleForJetpackCloud( state, selectedSiteId );
	const siteFeatures = getFeaturesBySiteId( state, selectedSiteId );
	if ( isEligible === null || ! siteFeatures ) {
		context.primary = <Landing />;
		next();
		return;
	}

	const landingPath = getLandingPath( state, selectedSiteId );
	page.redirect( landingPath );
};

export default function () {
	page( '/landing/:site', siteSelection, landingController, makeLayout, clientRender );
	page(
		'/landing',
		siteSelection,
		selectionPrompt,
		clearPageTitle,
		sites,
		makeLayout,
		clientRender
	);
	page( '/', redirectToPrimarySiteLanding, makeLayout, clientRender );
}
