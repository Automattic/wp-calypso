import { isPlan, isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { getName, isOneTimePurchase } from 'calypso/lib/purchases';
import type { Purchases } from '@automattic/data-stores';
import type { PurchaseForCopy } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';

/**
 * Adapt the legacy camelCase `Purchases.Purchase` into the snake_case
 * `PurchaseForCopy` shape expected by the shared confirmation-copy helper.
 * The dashboard side already matches `PurchaseForCopy` structurally and
 * passes its own Purchase directly.
 */
export function toPurchaseForCopy( purchase: Purchases.Purchase ): PurchaseForCopy {
	return {
		is_plan: isPlan( purchase ),
		is_domain_registration: Boolean( purchase.isDomainRegistration ),
		is_jetpack_plan_or_product: isJetpackPlan( purchase ) || isJetpackProduct( purchase ),
		product_slug: purchase.productSlug,
		product_name: getName( purchase ),
		product_type: purchase.productType ?? '',
		expiry_date: purchase.expiryDate ?? '',
		// Dashboard uses 'one-time-purchase'; legacy uses 'oneTimePurchase'. The
		// shared helper only distinguishes one-time vs everything else, so collapse
		// to the dashboard sentinel here.
		expiry_status: isOneTimePurchase( purchase ) ? 'one-time-purchase' : purchase.expiryStatus,
		meta: purchase.meta,
		domain: purchase.domain ?? '',
	};
}
