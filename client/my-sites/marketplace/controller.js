import page from '@automattic/calypso-router';
import { getSiteFragment } from 'calypso/lib/route';
import MarketplaceThankYou from 'calypso/my-sites/checkout/checkout-thank-you/marketplace/marketplace-thank-you';
import MarketplaceProductInstall from 'calypso/my-sites/marketplace/pages/marketplace-product-install';
import MarketplaceTest from 'calypso/my-sites/marketplace/pages/marketplace-test';
import SignupSuccess from 'calypso/my-sites/marketplace/pages/submission-success/signup-success';

export function renderPluginsInstallPage( context, next ) {
	const { productSlug } = context.params;
	context.primary = <MarketplaceProductInstall pluginSlug={ productSlug } />;
	next();
}

export function renderThemesInstallPage( context, next ) {
	const { themeSlug } = context.params;
	context.primary = <MarketplaceProductInstall themeSlug={ themeSlug } />;
	next();
}

export function renderMarketplaceThankYou( context, next ) {
	const { plugins, themes, continueWithPluginBundle, onboarding, styleVariation } = context.query;
	const pluginSlugs = plugins ? plugins.split( ',' ) : [];
	const themeSlugs = themes ? themes.split( ',' ) : [];

	context.primary = (
		<MarketplaceThankYou
			pluginSlugs={ pluginSlugs }
			themeSlugs={ themeSlugs }
			isOnboardingFlow={ onboarding !== undefined }
			styleVariationSlug={ styleVariation }
			continueWithPluginBundle={ continueWithPluginBundle }
		/>
	);
	next();
}

export function renderMarketplaceSignupSuccess( context, next ) {
	const { productSlug } = context.params;

	context.primary = <SignupSuccess productSlug={ productSlug } />;
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
