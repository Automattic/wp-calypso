/**
 * External dependencies
 */
import page from 'page';

/**
 * Navigation functions
 *
 * TODO: remove all feature flags from urls
 */

export function navigateToProductHomePage( selectedSiteSlug: string, pluginSlug: string ): void {
	page(
		`/marketplace/product/details/${ pluginSlug }/${ selectedSiteSlug }?flags=marketplace-yoast`
	);
}

export function navigateToInstallationThankYouPage( selectedSiteSlug: string ): void {
	page( `/marketplace/thank-you/${ selectedSiteSlug }?flags=marketplace-yoast` );
}

export function waitFor( seconds: number ): Promise< void > {
	return new Promise( ( resolve ) => setTimeout( resolve, seconds * 1000 ) );
}
