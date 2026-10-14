import { getOriginalReturnUrl, parsePositiveId } from '../../marketplace/pressable-return/lib';
import type { ReferralAPIResponse } from '../../referrals/types';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

type QueryContext = { agencyId: unknown; referralId: unknown };

const TITAN_MONTHLY_PRODUCT_PLANS: Record< number, string > = {
	3262: 'standard',
	3278: 'premium',
};

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
		! ( 'titan_plan' in extra ) ||
		extra.titan_plan !== plan ||
		! ( 'titan_domain' in extra ) ||
		! parsePositiveId( product.quantity )
	) {
		return;
	}
	const originalUrl = getOriginalReturnUrl( products, agencyId, { referralId, clientId } );
	if ( ! originalUrl ) {
		return;
	}
	const originalQuery = new URL( originalUrl ).searchParams;
	if (
		originalQuery.get( 'email' ) !== referral.client.email ||
		originalQuery.get( 'domain' )?.trim().toLowerCase() !== extra.titan_domain ||
		( originalQuery.get( 'plan' ) ?? 'standard' ) !== plan
	) {
		return;
	}

	return { agencyId, referralId, clientId };
}
