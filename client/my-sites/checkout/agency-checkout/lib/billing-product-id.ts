import type { AgencyProduct } from '@automattic/api-core';

export type AgencyCheckoutTerm = 'monthly' | 'yearly';

/**
 * The product WordPress.com bills for a line: the variant of the chosen term,
 * and for WordPress.com and Jetpack products the agency-specific id the store
 * accepts on an agency cart.
 */
export function getBillingProductId( product: AgencyProduct, term: AgencyCheckoutTerm ): number {
	const termProductId =
		( term === 'yearly' ? product.yearly_product_id : product.monthly_product_id ) ||
		product.product_id;
	const termAlternativeProductId =
		( term === 'yearly'
			? product.yearly_alternative_product_id
			: product.monthly_alternative_product_id ) || product.alternative_product_id;
	return termAlternativeProductId || termProductId;
}
