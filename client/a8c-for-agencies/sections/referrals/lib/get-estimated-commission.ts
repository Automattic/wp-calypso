import { Referral } from '../types';

/**
 * Sum the estimated commissions wpcom returns per referral purchase, for
 * either the current or previous payout quarter.
 *
 * Every purchase carries server-computed `estimated_commission_*_quarter`
 * numbers as of Aug 2025 — the JS-only legacy fallback (license dates ×
 * daily price × commission percentage) was removed when wpcom started
 * computing those numbers for legacy purchases too. Purchases without a
 * `commissions` block contribute 0 (rather than triggering the old
 * fallback compute, which was double-counting alongside the BD path in
 * mixed cases).
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
