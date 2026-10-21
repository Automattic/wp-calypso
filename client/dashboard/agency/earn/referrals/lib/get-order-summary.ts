import { __, _n, sprintf } from '@wordpress/i18n';
import { getProductName } from './get-product-name';
import type { AgencyProduct, ReferralApiResponse } from '@automattic/api-core';

export const MAX_SUMMARY_PRODUCT_NAMES = 3;

export function getOrderProductNames(
	order: ReferralApiResponse,
	products?: AgencyProduct[]
): string[] {
	return order.products.map( ( product ) => getProductName( product, products ) );
}

export function getOrderSummary( order: ReferralApiResponse, products?: AgencyProduct[] ) {
	if ( ! order.products.length ) {
		return __( 'Referral' );
	}
	const names = getOrderProductNames( order, products );
	if ( names.length <= MAX_SUMMARY_PRODUCT_NAMES ) {
		return names.join( ', ' );
	}
	const remaining = names.length - MAX_SUMMARY_PRODUCT_NAMES;
	return sprintf(
		/* translators: %1$s is a list of product names, %2$d is the number of products not shown */
		_n( '%1$s, and %2$d more', '%1$s, and %2$d more', remaining ),
		names.slice( 0, MAX_SUMMARY_PRODUCT_NAMES ).join( ', ' ),
		remaining
	);
}
