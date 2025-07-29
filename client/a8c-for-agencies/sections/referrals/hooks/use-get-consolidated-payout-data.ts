import { useMemo } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import {
	getCurrentCycleActivityWindow,
	getNextPayoutDateActivityWindow,
} from '../lib/get-next-payout-date';
import { Referral } from '../types';

export default function useGetConsolidatedPayoutData(
	referrals: Referral[],
	products?: APIProductFamilyProduct[]
) {
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } = useMemo( () => {
		const currentDate = new Date();
		const productsArray = products || [];

		// For current quarter: use getEstimatedCommission which handles API + legacy data
		const currentQuarterCommissions = getEstimatedCommission(
			referrals,
			productsArray,
			getCurrentCycleActivityWindow( currentDate )
		);

		// For previous quarter: we need to handle API data separately since getEstimatedCommission
		// only handles current quarter API data
		const previousQuarterApiCommissions = referrals.reduce( ( acc, referral ) => {
			return (
				acc +
				referral.purchases.reduce( ( purchaseAcc, purchase ) => {
					return purchaseAcc + ( purchase.commissions?.estimated_commission_previous_quarter ?? 0 );
				}, 0 )
			);
		}, 0 );

		// For previous quarter legacy calculations, we need to create a modified version
		// that uses previous quarter activity window but doesn't use current quarter API data
		const previousQuarterLegacyCommissions = getEstimatedCommission(
			referrals.map( ( referral ) => ( {
				...referral,
				purchases: referral.purchases.filter( ( purchase ) => ! purchase.commissions ),
			} ) ),
			productsArray,
			getNextPayoutDateActivityWindow( currentDate )
		);

		return {
			previousQuarterExpectedCommission:
				previousQuarterApiCommissions + previousQuarterLegacyCommissions,
			currentQuarterExpectedCommission: currentQuarterCommissions,
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
