import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { AppState } from 'calypso/types';

import 'calypso/state/themes/init';

/**
 * Returns whether the theme has been purchased for the given site. Note that
 * this only works for premium themes that are added to A8c repos --
 * marketplace themes need to be checked via isMarketplaceThemeSubscribed().
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param   {AppState} state   Global state tree
 * @param   {string}   themeId Theme ID
 * @param   {number}   siteId  Site ID
 * @returns {boolean}          True if the theme has been purchased for the site
 */
export function isThemePurchased(
	state: AppState,
	themeId: string,
	siteId: number | null
): boolean {
	const sitePurchases = getSitePurchases( state, siteId );

	return !! sitePurchases.find(
		( purchase ) => purchase.productType === 'theme' && purchase.meta === themeId
	);
}
