/**
 * External dependencies
 */
import { get } from 'lodash';

export function getUnformattedDomainSalePrice( slug, productsList ) {
	const saleCost = get( productsList, [ slug, 'sale_cost' ], null );
	const couponValidForNewDomainPurchase = get(
		productsList,
		[ slug, 'sale_coupon', 'allowed_for_new_purchases' ],
		null
	);

	if ( ! saleCost || ! couponValidForNewDomainPurchase ) {
		return null;
	}

	return saleCost;
}
