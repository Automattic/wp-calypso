//Navigation functions
export function navigateToProductHomePage(
	page: ( url: string ) => void,
	selectedSiteSlug = '',
	pluginSlug = 'wordpress-seo'
): void {
	page(
		`/marketplace/product/details/${ pluginSlug }/${ selectedSiteSlug }?flags=marketplace-yoast`
	);
}

export function navigateToInstallationThankYouPage(
	page: ( url: string ) => void,
	selectedSiteSlug = ''
): void {
	page( `/marketplace/thank-you/${ selectedSiteSlug }?flags=marketplace-yoast` );
}
