import { useMemo } from 'react';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import {
	getCurrentCycleActivityWindow,
	getNextPayoutDateActivityWindow,
} from '../lib/get-next-payout-date';
import { Referral } from '../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

export default function useGetConsolidatedPayoutData(
	referrals: Referral[],
	products?: APIProductFamilyProduct[]
) {
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } = useMemo( () => {
		const currentDate = new Date();
		const productsArray = products || [];

		return {
			previousQuarterExpectedCommission: getEstimatedCommission(
				referrals,
				productsArray,
				getNextPayoutDateActivityWindow( currentDate ),
				true // use previous quarter
			),
			currentQuarterExpectedCommission: getEstimatedCommission(
				referrals,
				productsArray,
				getCurrentCycleActivityWindow( currentDate ),
				false // use current quarter
			),
		};
	}, [ referrals, products ] );

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
