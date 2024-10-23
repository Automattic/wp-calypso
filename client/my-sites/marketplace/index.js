import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	renderDomainsPage,
	renderMarketplaceTestPage,
	renderMarketplaceThankYou,
	renderPluginsInstallPage,
	renderThemesInstallPage,
	redirectToHome,
	renderMarketplaceSignupSuccess,
	renderMarketplaceHomePage,
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

		page( '/marketplace/home', navigation, renderMarketplaceHomePage, makeLayout, clientRender );
	}

	if ( config.isEnabled( 'marketplace-domain-bundle' ) ) {
		page( '/marketplace/domain/:site?', renderDomainsPage, makeLayout, clientRender );
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

	page( '/marketplace/*', redirectToHome );
}
