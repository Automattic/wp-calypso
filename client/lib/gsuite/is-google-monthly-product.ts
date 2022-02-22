import { GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY } from '@automattic/calypso-products';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export function isGoogleMonthlyProduct( googleMailProduct: ProductListItem ): boolean {
	return googleMailProduct?.product_slug === GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY;
}
