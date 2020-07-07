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
import Home from './sections/home';
import { siteSelection, sites, navigation } from 'my-sites/controller';
import Landing from './sections/landing';

const selectionPrompt = ( context, next ) => {
	context.getSiteSelectionHeaderText = () =>
		translate( 'Select a site to open {{strong}}Jetpack.com{{/strong}}', {
			components: { strong: <strong /> },
		} );
	next();
};

const landingController = ( context, next ) => {
	context.primary = <Landing />;
	next();
};

export default function () {
	const homeController = ( context, next ) => {
		context.primary = <Home />;
		next();
	};
	page( '/', homeController, makeLayout, clientRender );
	page( '/landing', siteSelection, selectionPrompt, sites, navigation, makeLayout, clientRender );
	page( '/landing/:site', siteSelection, landingController, makeLayout, clientRender );
}
