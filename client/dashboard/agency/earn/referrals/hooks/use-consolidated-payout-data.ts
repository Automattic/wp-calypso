import { useMemo } from 'react';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import type { Referral } from '@automattic/api-core';

export default function useConsolidatedPayoutData( referrals: Referral[] ) {
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } = useMemo( () => {
		return {
			previousQuarterExpectedCommission: getEstimatedCommission( referrals, true ),
			currentQuarterExpectedCommission: getEstimatedCommission( referrals, false ),
		};
	}, [ referrals ] );

	const pendingOrders = useMemo(
		() =>
			referrals.reduce(
				( acc, referral ) =>
					acc + referral.referralStatuses.filter( ( status ) => status === 'pending' ).length,
				0
			),
		[ referrals ]
	);

	return {
		previousQuarterExpectedCommission,
		currentQuarterExpectedCommission,
		pendingOrders,
	};
}
