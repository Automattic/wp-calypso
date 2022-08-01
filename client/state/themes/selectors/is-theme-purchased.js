import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getThemeNameFromMeta } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme has been purchased for the site
 */
export function isThemePurchased( state, themeId, siteId ) {
	const sitePurchases = getSitePurchases( state, siteId );
	return sitePurchases.some( ( purchase ) => {
		if ( purchase?.productSlug === 'premium_theme' ) {
			const purchaseThemeId = getThemeNameFromMeta( purchase.meta );
			return themeId === purchaseThemeId;
		}
		return false;
	} );
}
