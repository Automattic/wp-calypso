import page from 'page';
import { getSiteFragment } from 'calypso/lib/route';
import MarketplaceThankYou from 'calypso/my-sites/checkout/checkout-thank-you/marketplace/marketplace-thank-you';
import MarketplaceDomainUpsell from 'calypso/my-sites/marketplace/pages/marketplace-domain-upsell';
import MarketplacePluginInstall from 'calypso/my-sites/marketplace/pages/marketplace-plugin-install';
import MarketplaceTest from 'calypso/my-sites/marketplace/pages/marketplace-test';

export function renderDomainsPage( context, next ) {
	context.primary = <MarketplaceDomainUpsell />;
	next();
}

export function renderPluginsInstallPage( context, next ) {
	const { productSlug } = context.params;
	context.primary = <MarketplacePluginInstall productSlug={ productSlug } />;
	next();
}

export function renderMarketplaceThankYou( context, next ) {
	const { productSlug } = context.params;

	context.primary = <MarketplaceThankYou productSlug={ productSlug } />;
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
