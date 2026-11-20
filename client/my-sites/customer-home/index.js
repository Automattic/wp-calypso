import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { forwardStudioHomeLink } from 'calypso/my-sites/checkout/studio-return/home-forward';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import renderHome, { maybeRedirect, redirectToLandingPage } from './controller';

export default function () {
	// Redirect old view routes to home
	page( '/view', () => page.redirect( '/home' ) );
	page( '/view/:siteId', ( context ) => page.redirect( `/home/${ context.params.siteId }` ) );

	// Home routes
	page( '/home', redirectToLandingPage, siteSelection, sites, makeLayout, clientRender );

	page(
		'/home/:site',
		forwardStudioHomeLink,
		siteSelection,
		maybeRedirect,
		navigation,
		renderHome,
		makeLayout,
		clientRender
	);
}
