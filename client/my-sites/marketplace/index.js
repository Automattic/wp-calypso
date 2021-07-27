/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import config from '@automattic/calypso-config';
import {
	renderDomainsPage,
	renderMarketplaceProduct,
	renderMarketplaceTestPage,
	renderMarketplaceThankYou,
	renderPluginsSetupStatusPage,
	redirectToHome,
	enforceSiteEnding,
} from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	if ( config.isEnabled( 'marketplace-test' ) ) {
		page( '/marketplace/test', siteSelection, sites, makeLayout, clientRender );

		page(
			'/marketplace/test/:site?',
			enforceSiteEnding,
			siteSelection,
			navigation,
			renderMarketplaceTestPage,
			makeLayout,
			clientRender
		);
	}

	if ( config.isEnabled( 'marketplace-yoast' ) ) {
		page(
			'/marketplace/domain/:site?',
			enforceSiteEnding,
			renderDomainsPage,
			makeLayout,
			clientRender
		);
		page(
			'/marketplace/product/setup/:site?',
			siteSelection,
			renderPluginsSetupStatusPage,
			makeLayout,
			clientRender
		);
		page( '/marketplace/product/details', siteSelection, sites, makeLayout, clientRender );
		page(
			'/marketplace/product/details/:site?',
			enforceSiteEnding,
			navigation,
			siteSelection,
			renderMarketplaceProduct,
			makeLayout,
			clientRender
		);
		page(
			'/marketplace/product/details/:productGroupSlug/:site?',
			enforceSiteEnding,
			navigation,
			siteSelection,
			renderMarketplaceProduct,
			makeLayout,
			clientRender
		);
		page(
			'/marketplace/product/details/:productGroupSlug/:productSlug/:site?',
			enforceSiteEnding,
			navigation,
			siteSelection,
			renderMarketplaceProduct,
			makeLayout,
			clientRender
		);
		page(
			'/marketplace/thank-you/:site?',
			enforceSiteEnding,
			siteSelection,
			renderMarketplaceThankYou,
			makeLayout,
			clientRender
		);
	}

	page( '/marketplace/*', redirectToHome );
}
