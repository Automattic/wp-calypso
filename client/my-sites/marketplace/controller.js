/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

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
	// context.primary = (
	// 	<AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-stand-alone-thank-you" />
	// );
	context.primary = <div>Not Implemented</div>;
	next();
}

export function renderMarketplaceTestPage( context, next ) {
	// context.primary = <AsyncLoad require="calypso/my-sites/plugins/marketplace/marketplace-test" />;
	context.primary = <div>Not Implemented</div>;
	next();
}

export function redirectToHome( { path } ) {
	const siteFragment = getSiteFragment( path );
	if ( siteFragment ) {
		return page.redirect( `/home/${ siteFragment }` );
	}
	return page.redirect( '/home' );
}
