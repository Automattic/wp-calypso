/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import { makeLayout, render as clientRender } from 'controller';
import { siteSelection, sites, navigation } from 'my-sites/controller';
import { getCurrentUser } from 'state/current-user/selectors';
import Landing from './sections/landing';

const selectionPrompt = ( context, next ) => {
	context.getSiteSelectionHeaderText = () =>
		translate( 'Select a site to open {{strong}}Jetpack.com{{/strong}}', {
			components: { strong: <strong /> },
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

export default function () {
	page( '/', siteSelection, redirectToPrimarySiteLanding );
	page( '/landing', siteSelection, selectionPrompt, sites, navigation, makeLayout, clientRender );
	page( '/landing/:site', siteSelection, landingController, makeLayout, clientRender );
}
