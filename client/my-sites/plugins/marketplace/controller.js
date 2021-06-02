/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { getSiteFragment } from 'calypso/lib/route';
import AsyncLoad from 'calypso/components/async-load';
import MarketplacePluginDetails from 'calypso/my-sites/plugins/marketplace/marketplace-plugin-details';

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
	context.primary = (
		<AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-domain-upsell" />
	);
	next();
}

export function renderPluginsSetupStatusPage( context, next ) {
	context.primary = (
		<AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status" />
	);
	next();
}

export function renderMarketplaceThankYou( context, next ) {
	context.primary = (
		<AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-stand-alone-thank-you" />
	);
	next();
}

export function renderMarketplaceTestPage( context, next ) {
	context.primary = <AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-test" />;
	next();
}
