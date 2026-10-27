import { isPressableTitanProduct } from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import type { ReferralPurchase } from '../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

export type TitanReferralPlan = 'standard' | 'premium';

export interface TitanReferralDetails {
	domain?: string;
	plan?: TitanReferralPlan;
	inboxes?: number;
}

const isPositiveInteger = ( value: unknown ): value is number =>
	typeof value === 'number' && Number.isInteger( value ) && value > 0;

const isTitanPlan = ( value: unknown ): value is TitanReferralPlan =>
	value === 'standard' || value === 'premium';

/**
 * Resolve the Titan order identity for a referral product, or null when the
 * product is not a Titan inbox order. Each field is only set when the API
 * supplied it; nothing is inferred from the product id.
 */
export default function getTitanReferralDetails(
	purchase: Pick< ReferralPurchase, 'product_id' | 'quantity' | 'license' | 'meta' >,
	productsData?: APIProductFamilyProduct[]
): TitanReferralDetails | null {
	const licenseKey = purchase.license?.license_key ?? '';
	const catalogSlug =
		productsData?.find( ( product ) =>
			[ product.product_id, product.monthly_product_id, product.yearly_product_id ].includes(
				purchase.product_id
			)
		)?.slug ?? '';

	if ( ! isPressableTitanProduct( licenseKey ) && ! isPressableTitanProduct( catalogSlug ) ) {
		return null;
	}

	const details: TitanReferralDetails = {};

	if ( purchase.meta?.titan_domain ) {
		details.domain = purchase.meta.titan_domain;
	}

	if ( isTitanPlan( purchase.meta?.titan_plan ) ) {
		details.plan = purchase.meta.titan_plan;
	}

	// The license quantity follows completed inbox increases; a pending referral
	// has no license yet, so its requested quantity is the only known amount.
	if ( isPositiveInteger( purchase.license?.quantity ) ) {
		details.inboxes = purchase.license.quantity;
	} else if ( isPositiveInteger( purchase.quantity ) ) {
		details.inboxes = purchase.quantity;
	}

	return details;
}
