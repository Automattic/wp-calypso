/**
 * External dependencies
 */
import { IProductCollection, IProductGroupCollection } from 'calypso/my-sites/marketplace/types';
import page from 'page';

/**
 * Navigation functions
 *
 */

export function navigateToProductGroupHomePage(
	selectedSiteSlug: keyof IProductCollection,
	productGroupSlug: keyof IProductGroupCollection
): void {
	page( `/marketplace/product/details/${ productGroupSlug }/${ selectedSiteSlug }` );
}

export function navigateToInstallationThankYouPage( selectedSiteSlug: string ): void {
	page( `/marketplace/thank-you/${ selectedSiteSlug }` );
}

export function waitFor( seconds: number ): Promise< void > {
	return new Promise( ( resolve ) => setTimeout( resolve, seconds * 1000 ) );
}
