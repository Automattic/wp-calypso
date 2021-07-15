/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSiteFragment } from 'calypso/lib/route';
import MarketplacePluginDetails from 'calypso/my-sites/marketplace/pages/marketplace-product-details';
import MarketplaceDomainUpsell from 'calypso/my-sites/marketplace/pages/marketplace-domain-upsell';
import MarketplacePluginSetup from 'calypso/my-sites/marketplace/pages/marketplace-plugin-setup-status';
import MarketplaceStandaloneThankYou from 'calypso/my-sites/marketplace/pages/marketplace-stand-alone-thank-you';
import MarketplaceTest from 'calypso/my-sites/marketplace/pages/marketplace-test';
import { getDefaultProductInProductGroup } from 'calypso/my-sites/marketplace/marketplace-product-definitions';

export function renderMarketplaceProduct( context, next ) {
	const siteFragment = getSiteFragment( context.path );
	const { productSlug: productSlugParam, productGroupSlug: productGroupSlugParam } = context.params;
	let productSlug = productSlugParam ? decodeURIComponent( productSlugParam ) : null;
	const productGroupSlug = productGroupSlugParam
		? decodeURIComponent( productGroupSlugParam )
		: null;

	if ( ! siteFragment ) {
		return page.redirect( '/home' );
	} else if ( ! productGroupSlug && ! productSlug ) {
		return page.redirect( `/home/${ siteFragment }` );
	} else if ( ! productSlug ) {
		productSlug = getDefaultProductInProductGroup( productGroupSlug );
		return page.redirect(
			`/marketplace/product/details/${ productGroupSlug }/${ productSlug }/${ siteFragment }`
		);
	}
	context.primary = (
		<MarketplacePluginDetails productGroupSlug={ productGroupSlug } productSlug={ productSlug } />
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
