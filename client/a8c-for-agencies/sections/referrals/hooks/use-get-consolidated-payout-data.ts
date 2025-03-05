import { useMemo } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import { Referral } from '../types';

export default function useGetConsolidatedPayoutData(
	referrals: Referral[],
	products?: APIProductFamilyProduct[]
) {
	const expectedCommission = useMemo(
		() => getEstimatedCommission( referrals, products || [] ),
		[ referrals, products ]
	);

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
		expectedCommission,
		pendingOrders,
	};
}
