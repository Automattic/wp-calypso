import { PLAN_BUSINESS } from '@automattic/calypso-products';
import { marketplaceThemeBillingProductSlug } from 'calypso/my-sites/themes/helpers';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { getPreferredBillingCycleProductSlug } from '../theme-utils';
import type { AppState } from 'calypso/types';

const getMarketplaceThemeProducts = ( state: AppState, themeId: string | null ) => {
	const marketplaceThemeProducts = getProductsByBillingSlug(
		state,
		marketplaceThemeBillingProductSlug( themeId )
	);
	return marketplaceThemeProducts || [];
};

/**
 * Get the Product representing the Marketplace Theme for the given themeId.
 *
 * Will return undefined if the themeId is null or if the themeId does not have a corresponding Marketplace Theme Product.
 */
export function getMarketplaceThemeProduct( state: AppState, themeId: string | null ) {
	const marketplaceThemeProducts = getMarketplaceThemeProducts( state, themeId );

	const marketplaceProductSlug =
		marketplaceThemeProducts.length !== 0
			? getPreferredBillingCycleProductSlug( marketplaceThemeProducts, PLAN_BUSINESS )
			: null;

	const selectedMarketplaceProduct =
		marketplaceThemeProducts.find(
			( product ) => product.product_slug === marketplaceProductSlug
		) || marketplaceThemeProducts[ 0 ];

	return selectedMarketplaceProduct;
}
