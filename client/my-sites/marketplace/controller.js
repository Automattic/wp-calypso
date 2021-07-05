/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSiteFragment } from 'calypso/lib/route';
import { MarketplaceProductDetails } from 'calypso/my-sites/marketplace/marketplace-product-details';
import MarketplaceDomainUpsell from 'calypso/my-sites/marketplace/marketplace-domain-upsell';
import MarketplacePluginSetup from 'calypso/my-sites/marketplace/marketplace-plugin-setup-status';
import MarketplaceStandaloneThankYou from 'calypso/my-sites/marketplace/marketplace-stand-alone-thank-you';
import MarketplaceTest from 'calypso/my-sites/marketplace/marketplace-test';
import { getDefaultProductInProductGroup } from 'calypso/my-sites/marketplace/constants';

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
		<MarketplaceProductDetails productGroupSlug={ productGroupSlug } productSlug={ productSlug } />
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
