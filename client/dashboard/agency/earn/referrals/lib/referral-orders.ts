import type { Referral, ReferralApiResponse, ReferralPurchase } from '@automattic/api-core';

const INACTIVE_STATUSES = [ 'archived', 'canceled' ];

/**
 * Sorts archived and canceled referrals to the bottom, since they are no longer
 * actionable. The sort is stable, so the API's order holds within each group.
 */
export function sortReferralOrders( orders: ReferralApiResponse[] ): ReferralApiResponse[] {
	const rank = ( order: ReferralApiResponse ) =>
		INACTIVE_STATUSES.includes( order.status ) ? 1 : 0;
	return orders.slice().sort( ( a, b ) => rank( a ) - rank( b ) );
}

/**
 * Purchases belonging to an archived referral are hidden: the client can no
 * longer complete them, so they are not real purchases.
 */
export function getActivePurchases( referral: Referral ): ReferralPurchase[] {
	const archivedReferralIds = new Set(
		referral.referrals
			.filter( ( order ) => order.status === 'archived' )
			.map( ( order ) => order.id )
	);
	return referral.purchases.filter(
		( purchase ) => ! archivedReferralIds.has( purchase.referral_id )
	);
}
