import 'calypso/state/products-list/init';
import { getProductBySlug } from 'calypso/state/products-list/selectors/get-product-by-slug';
import { getTheme } from 'calypso/state/themes/selectors';
import type { ProductListItem } from './get-products-list';
import type { AppState, Theme } from 'calypso/types';

/**
 * Retrieves the billing product slug give a theme id.
 * @param {Object} state - global state tree
 * @param {string} themeId theme id
 * @returns {string} the corresponding billing product slug
 */
export function getProductBillingSlugByThemeId( state: AppState, themeId: string ): string | null {
	const theme: Theme | undefined = getTheme( state, 'wpcom', themeId );
	const productSlugs = theme.product_details.map( ( product ) => product.product_slug );

	const products: ProductListItem[] = productSlugs.map( ( productSlug ) => {
		return getProductBySlug( state, productSlug );
	} );

	return products[ 0 ].billing_product_slug;
}
