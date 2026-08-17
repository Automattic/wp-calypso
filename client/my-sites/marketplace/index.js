import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	renderMarketplaceTestPage,
	renderMarketplaceThankYou,
	renderPluginsInstallPage,
	renderThemesInstallPage,
	redirectToHome,
	redirectToPlugins,
	renderMarketplaceSignupSuccess,
	renderMarketplaceWaitDemo,
} from './controller';

export default function () {
	if ( config.isEnabled( 'marketplace-test' ) ) {
		page(
			'/marketplace/test/:site?',
			siteSelection,
			navigation,
			renderMarketplaceTestPage,
			makeLayout,
			clientRender
		);
	}

	// A replayable stage for the transfer wait UIs; exists only where the honest wait does.
	if ( config.isEnabled( 'marketplace-honest-install-progress' ) ) {
		page( '/marketplace/wait-demo', renderMarketplaceWaitDemo, makeLayout, clientRender );
	}

	page(
		'/marketplace/plugin/:productSlug?/install/:site?',
		siteSelection,
		renderPluginsInstallPage,
		makeLayout,
		clientRender
	);

	page(
		'/marketplace/theme/:themeSlug?/install/:site?',
		siteSelection,
		renderThemesInstallPage,
		makeLayout,
		clientRender
	);

	page(
		'/marketplace/thank-you/:site?',
		siteSelection,
		renderMarketplaceThankYou,
		makeLayout,
		clientRender
	);

	page(
		'/marketplace/submission-success',
		renderMarketplaceSignupSuccess,
		makeLayout,
		clientRender
	);

	// The wildcard below requires a path segment after the slash, so the bare
	// path needs its own route or it renders nothing at all.
	page( '/marketplace', redirectToPlugins );

	page( '/marketplace/*', redirectToHome );
}
