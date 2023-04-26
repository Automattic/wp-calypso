import { getSitePurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/themes/init';

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {Array}  Array of themeIds that have been purchased
 */
export function getPurchasedThemes( state, siteId ) {
	const sitePurchases = getSitePurchases( state, siteId );
	return sitePurchases
		.filter( ( purchase ) => purchase?.productType === 'theme' )
		.map( ( purchase ) => purchase.meta );
}
