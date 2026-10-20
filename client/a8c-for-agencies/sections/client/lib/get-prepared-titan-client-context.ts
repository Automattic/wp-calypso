import type { ReferralAPIResponse } from '../../referrals/types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

type QueryContext = { agencyId: unknown; referralId: unknown };

const TITAN_MONTHLY_PRODUCT_PLANS: Record< number, string > = {
	3262: 'standard',
	3278: 'premium',
};

export function parsePositiveId( value: unknown ): number | undefined {
	if ( typeof value !== 'string' && typeof value !== 'number' ) {
		return;
	}
	const identifier = String( value );
	if (
		identifier !== identifier.trim() ||
		! /^[1-9]\d*$/.test( identifier ) ||
		! Number.isSafeInteger( Number( value ) )
	) {
		return;
	}
	return Number( value );
}

export default function getPreparedTitanClientContext(
	products: ResponseCartProduct[],
	queryContext: QueryContext,
	referral: Pick< ReferralAPIResponse, 'id' | 'client' > | undefined
) {
	const agencyId = parsePositiveId( queryContext.agencyId );
	const referralId = parsePositiveId( queryContext.referralId );
	const clientId = parsePositiveId( referral?.client?.id );
	if (
		! agencyId ||
		! referralId ||
		! clientId ||
		parsePositiveId( referral?.id ) !== referralId ||
		! referral?.client?.email ||
		products.length !== 1
	) {
		return;
	}

	const product = products[ 0 ];
	const extra = product.extra;
	// These are the existing monthly Store billing IDs, independent of catalog visibility.
	const plan = TITAN_MONTHLY_PRODUCT_PLANS[ product.product_id ];
	if (
		! plan ||
		! extra ||
		! extra.isA4ASitelessCheckout ||
		parsePositiveId( extra.agency_id ) !== agencyId ||
		parsePositiveId( extra.referral_id ) !== referralId ||
		! ( 'titan_plan' in extra ) ||
		extra.titan_plan !== plan ||
		! ( 'titan_domain' in extra ) ||
		typeof extra.titan_domain !== 'string' ||
		! extra.titan_domain ||
		! parsePositiveId( product.quantity )
	) {
		return;
	}

	return { agencyId, referralId, clientId };
}
