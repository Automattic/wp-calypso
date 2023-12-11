import page from '@automattic/calypso-router';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { managePurchase } from 'calypso/me/purchases/paths';

/**
 * Redirects users to the appropriate URL to manage a site purchase.
 * On cloud.jetpack.com, the URL will point to wordpress.com. In any other case,
 * it will point to a relative path to the site purchase.
 * @param {string} siteSlug Selected site
 * @param {number} purchaseId Id of a purchase
 */
export default function manageSitePurchase( siteSlug: string, purchaseId: number ): void {
	const relativePath = managePurchase( siteSlug, purchaseId );
	if ( isJetpackCloud() ) {
		window.location.href = `https://wordpress.com${ relativePath }`;
	} else {
		page( relativePath );
	}
}
