import { formatCurrency } from '@automattic/number-formatters';

export function getDomainTransferSalePrice( slug, productsList, currencyCode ) {
	const saleCost = productsList?.[ slug ]?.sale_cost ?? null;
	const couponValidForDomainTransfer =
		productsList?.[ slug ]?.sale_coupon?.allowed_for_domain_transfers ?? null;

	if ( ! saleCost || ! couponValidForDomainTransfer ) {
		return null;
	}

	return formatCurrency( saleCost, currencyCode );
}
