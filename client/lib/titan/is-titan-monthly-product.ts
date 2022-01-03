import { TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export function isTitanMonthlyProduct( titanMailProduct: ProductListItem ): boolean {
	return titanMailProduct?.product_slug === TITAN_MAIL_MONTHLY_SLUG;
}
