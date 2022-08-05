import { getSitePurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/themes/init';

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {Array}  Array of themeIds that have been purchased
 */
export function getPurchasedThemes( state, siteId ) {
	const sitePurchases = getSitePurchases( state, siteId );
	// TODO: productSlug check can be removed after the backend is changed to return productType
	return sitePurchases
		.filter(
			( purchase ) => purchase?.productSlug === 'premium_theme' || purchase?.productType === 'theme'
		)
		.map( ( purchase ) => purchase.meta );
}
