/**
 * External dependencies
 */
import Debug from 'debug';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { siteSelection, sites } from 'calypso/my-sites/controller';
import { startJetpackCloudOAuthOverride } from 'calypso/lib/jetpack/oauth-override';
import { translate } from 'i18n-calypso';
import Landing from './sections/landing';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';

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

const redirectToPrimarySiteLanding = ( context ) => {
	debug( 'controller: redirectToPrimarySiteLanding', context );
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );

	isJetpackSite( state, currentUser.primary_blog )
		? page( `/landing/${ currentUser.primarySiteSlug }` )
		: page( `/landing` );
};

const landingController = ( context, next ) => {
	debug( 'controller: landingController', context );
	context.primary = <Landing />;
	next();
};

export const handleOAuthOverride = () => {
	debug( 'controller: handleOAuthOverride' );
	startJetpackCloudOAuthOverride();
	window.location.replace( '/' );
};

export default function () {
	page( '/landing/:site', siteSelection, landingController, makeLayout, clientRender );
	page( '/landing', siteSelection, selectionPrompt, sites, makeLayout, clientRender );
	page( '/oauth-override', handleOAuthOverride );
	page( '/', redirectToPrimarySiteLanding );
}
