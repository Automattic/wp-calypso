/**
 * External dependencies
 */
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

export function getDomainTransferSalePrice( slug, productsList, currencyCode ) {
	const saleCost = get( productsList, [ slug, 'sale_cost' ], null );
	const couponValidForDomainTransfer = get(
		productsList,
		[ slug, 'sale_coupon', 'allowed_for_domain_transfers' ],
		null
	);

	if ( ! saleCost || ! couponValidForDomainTransfer ) {
		return null;
	}

	return formatCurrency( saleCost, currencyCode );
}
