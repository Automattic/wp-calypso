import 'calypso/state/products-list/init';
import { getTheme } from 'calypso/state/themes/selectors';
import type { AppState, Theme } from 'calypso/types';

/**
 * Retrieves the billing product slug give a theme id.
 * @param {Object} state - global state tree
 * @param {string} themeId theme id
 * @returns {string} the corresponding billing product slug
 */
export function getProductBillingSlugByThemeId( state: AppState, themeId: string ): string {
	const theme: Theme | undefined = getTheme( state, 'wpcom', themeId );

	if ( theme?.product_details?.[ 0 ]?.billing_product_slug !== undefined ) {
		return theme.product_details[ 0 ].billing_product_slug;
	}

	return `wp-mp-theme-${ themeId }`;
}
