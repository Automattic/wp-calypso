/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePurchases } from 'calypso/state/purchases/selectors';

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
	return some( sitePurchases, { productSlug: 'premium_theme', meta: themeId } );
}
