import { useMemo } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getEstimatedCommission } from '../lib/get-estimated-commission';
import { getNextPayoutDate, getNextPayoutDateActivityWindow } from '../lib/get-next-payout-date';
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

	const nextPayoutActivityWindow = useMemo( () => {
		const { start, finish } = getNextPayoutDateActivityWindow( new Date() );
		const startDate = start.toLocaleString( 'default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		} );
		const finishDate = finish.toLocaleString( 'default', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		} );
		return `${ startDate } - ${ finishDate }`;
	}, [] );

	const nextPayoutDate = useMemo(
		() =>
			getNextPayoutDate( new Date() ).toLocaleString( 'default', {
				month: 'short',
				day: 'numeric',
			} ),
		[]
	);

	return {
		expectedCommission,
		pendingOrders,
		nextPayoutActivityWindow,
		nextPayoutDate,
	};
}
