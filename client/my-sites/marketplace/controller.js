import page from 'page';
import React from 'react';
import { navigate } from 'calypso/lib/navigate';
import { getSiteFragment } from 'calypso/lib/route';
import { marketplaceDebugger } from 'calypso/my-sites/marketplace/constants';
import { getDefaultProductInProductGroup } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
import MarketplaceDomainUpsell from 'calypso/my-sites/marketplace/pages/marketplace-domain-upsell';
import MarketplacePluginSetup from 'calypso/my-sites/marketplace/pages/marketplace-plugin-setup-status';
import MarketplacePluginDetails from 'calypso/my-sites/marketplace/pages/marketplace-product-details';
import MarketplaceStandaloneThankYou from 'calypso/my-sites/marketplace/pages/marketplace-stand-alone-thank-you';
import MarketplaceTest from 'calypso/my-sites/marketplace/pages/marketplace-test';

export function renderMarketplaceProduct( context, next ) {
	const siteFragment = getSiteFragment( context.path );
	const { productSlug: productSlugParam, productGroupSlug: productGroupSlugParam } = context.params;
	let productSlug = productSlugParam ? decodeURIComponent( productSlugParam ) : null;
	const productGroupSlug = productGroupSlugParam
		? decodeURIComponent( productGroupSlugParam )
		: null;

	if ( ! productGroupSlug && ! productSlug ) {
		marketplaceDebugger( 'The productSlug and productGroupSlug were note set' );
		return navigate( `/home/${ siteFragment }` );
	} else if ( ! productSlug ) {
		productSlug = getDefaultProductInProductGroup( productGroupSlug );
		return navigate(
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
