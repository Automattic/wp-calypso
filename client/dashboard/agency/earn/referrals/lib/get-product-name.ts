import type { AgencyProduct, ReferralPurchase } from '@automattic/api-core';

/**
 * A referral stores the product the client was offered, which may be a monthly,
 * yearly, or alternative variant, so every catalog id has to be considered.
 */
export function findAgencyProduct(
	productId: number,
	products?: AgencyProduct[]
): AgencyProduct | undefined {
	return products?.find( ( product ) =>
		[
			product.product_id,
			product.monthly_product_id,
			product.yearly_product_id,
			product.alternative_product_id,
			product.monthly_alternative_product_id,
			product.yearly_alternative_product_id,
		].includes( productId )
	);
}

/**
 * The purchase only carries a subscription once the client has paid, so unpaid
 * referrals fall back to the product catalog for a display name.
 */
export function getProductName( purchase: ReferralPurchase, products?: AgencyProduct[] ): string {
	return (
		purchase.subscription?.product_name ??
		findAgencyProduct( purchase.product_id, products )?.name ??
		`#${ purchase.product_id }`
	);
}
