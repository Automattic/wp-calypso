/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import config from '@automattic/calypso-config';
import {
	renderDomainsPage,
	renderMarketplacePlugin,
	renderMarketplaceTestPage,
	renderMarketplaceThankYou,
	renderPluginsSetupStatusPage,
	redirectToHome,
} from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

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

	if ( config.isEnabled( 'marketplace-yoast' ) ) {
		page( '/marketplace/domain/:site?', renderDomainsPage, makeLayout, clientRender );
		page(
			'/marketplace/product/setup/:site?',
			siteSelection,
			renderPluginsSetupStatusPage,
			makeLayout,
			clientRender
		);
		page(
			'/marketplace/product/details/:plugin/:site?',
			navigation,
			siteSelection,
			renderMarketplacePlugin,
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
	}

	page( '/marketplace/*', redirectToHome );
}
