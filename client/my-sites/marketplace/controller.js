/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSiteFragment } from 'calypso/lib/route';
import MarketplacePluginDetails from 'calypso/my-sites/plugins/marketplace/marketplace-plugin-details';
import MarketplaceDomainUpsell from 'calypso/my-sites/plugins/marketplace/marketplace-domain-upsell';
import MarketplacePluginSetup from 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status';
import MarketplaceStandaloneThankYou from 'calypso/my-sites/plugins/marketplace/marketplace-stand-alone-thank-you';
import MarketplaceTest from 'calypso/my-sites/plugins/marketplace/marketplace-test';

export function renderMarketplacePlugin( context, next ) {
	const siteUrl = getSiteFragment( context.path );

	const pluginSlug = decodeURIComponent( context.params.plugin );

	context.primary = (
		<MarketplacePluginDetails
			path={ context.path }
			marketplacePluginSlug={ pluginSlug }
			siteUrl={ siteUrl }
		/>
	);

	next();
}

export function renderDomainsPage( context, next ) {
	context.primary = <MarketplaceDomainUpsell />;
	next();
}

export function renderPluginsSetupStatusPage( context, next ) {
	context.primary = <MarketplacePluginSetup />;
	next();
}

export function renderMarketplaceThankYou( context, next ) {
	context.primary = <MarketplaceStandaloneThankYou />;
	next();
}

export function renderMarketplaceTestPage( context, next ) {
	context.primary = <MarketplaceTest />;
	next();
}

export function redirectToHome( { path } ) {
	const siteFragment = getSiteFragment( path );
	if ( siteFragment ) {
		return page.redirect( `/home/${ siteFragment }` );
	}
	return page.redirect( '/home' );
}
