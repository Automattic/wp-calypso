import type { Referral } from '@automattic/api-core';

/**
 * Sum the estimated commissions wpcom returns per referral purchase, for
 * either the current or previous payout quarter.
 */
export const getEstimatedCommission = (
	referrals: Referral[],
	usePreviousQuarter: boolean = false
) => {
	const total = referrals.reduce( ( acc, referral ) => {
		if ( ! referral?.purchases?.length ) {
			return acc;
		}
		for ( const purchase of referral.purchases ) {
			// Walk only 'active' / 'cancelled' subscriptions; pending and
			// error purchases haven't produced commissionable activity.
			if ( ! purchase || purchase.status === 'pending' || purchase.status === 'error' ) {
				continue;
			}
			if ( ! purchase.commissions ) {
				continue;
			}
			acc += usePreviousQuarter
				? purchase.commissions.estimated_commission_previous_quarter ?? 0
				: purchase.commissions.estimated_commission_current_quarter ?? 0;
		}
		return acc;
	}, 0 );

	return Number( total.toFixed( 2 ) );
};
