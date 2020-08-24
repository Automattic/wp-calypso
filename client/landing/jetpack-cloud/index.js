/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import { makeLayout, render as clientRender } from 'controller';
import { siteSelection, sites } from 'my-sites/controller';
import { startJetpackCloudOAuthOverride } from 'lib/jetpack/oauth-override';
import { translate } from 'i18n-calypso';
import Landing from './sections/landing';

const selectionPrompt = ( context, next ) => {
	context.getSiteSelectionHeaderText = () =>
		// When "text-transform: capitalize;" is active,
		// (see rule for "".sites__select-heading strong")
		// Jetpack.com displays as Jetpack.Com in some browsers (e.g., Chrome)
		translate( 'Select a site to open {{strong}}Jetpack.com{{/strong}}', {
			components: { strong: <strong style={ { 'text-transform': 'none' } } /> },
		} );
	next();
};

const redirectToPrimarySiteLanding = ( context ) => {
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );

	page( `/landing/${ currentUser?.primarySiteSlug ?? '' }` );
};

const landingController = ( context, next ) => {
	context.primary = <Landing />;
	next();
};

export const handleOAuthOverride = () => {
	startJetpackCloudOAuthOverride();
	window.location.replace( '/' );
};

export default function () {
	page( '/landing/:site', siteSelection, landingController, makeLayout, clientRender );
	page( '/landing', siteSelection, selectionPrompt, sites, makeLayout, clientRender );
	page( '/oauth-override', handleOAuthOverride );
	page( '/', siteSelection, redirectToPrimarySiteLanding );
}
