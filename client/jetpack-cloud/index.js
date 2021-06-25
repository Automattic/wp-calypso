/**
 * External dependencies
 */
import Debug from 'debug';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sites, siteSelection } from 'calypso/my-sites/controller';
import { translate } from 'i18n-calypso';
import Landing from './sections/landing';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getPrimarySiteIsJetpack from 'calypso/state/selectors/get-primary-site-is-jetpack';

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

const redirectToPrimarySiteLanding = ( context ) => {
	debug( 'controller: redirectToPrimarySiteLanding', context );
	const state = context.store.getState();
	const currentUser = getCurrentUser( state );
	const isPrimarySiteJetpackSite = getPrimarySiteIsJetpack( state );

	isPrimarySiteJetpackSite
		? page( `/landing/${ currentUser.primarySiteSlug }` )
		: page( `/landing` );
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
	page( '/', redirectToPrimarySiteLanding );
}
