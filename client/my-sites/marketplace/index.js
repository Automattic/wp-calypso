import config from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	renderDomainsPage,
	renderMarketplaceTestPage,
	renderMarketplaceThankYou,
	renderPluginsInstallPage,
	redirectToHome,
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

	if ( config.isEnabled( 'marketplace-domain-bundle' ) ) {
		page( '/marketplace/domain/:site?', renderDomainsPage, makeLayout, clientRender );
	}

	page(
		'/marketplace/:productSlug?/install/:site?',
		siteSelection,
		renderPluginsInstallPage,
		makeLayout,
		clientRender
	);
	page(
		'/marketplace/thank-you/:productSlug/:site?',
		siteSelection,
		renderMarketplaceThankYou,
		makeLayout,
		clientRender
	);

	page( '/marketplace/*', redirectToHome );
}
