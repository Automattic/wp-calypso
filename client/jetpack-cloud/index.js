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
import Landing from './sections/landing';

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
	context.primary = <Landing />;
	next();
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
