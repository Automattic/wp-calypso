import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Referral, ReferralAPIResponse } from '../types';

export const getReferralsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referrals', agencyId ];
};

const getClientReferrals = ( referrals: ReferralAPIResponse[] ) => {
	const sortedReferrals = referrals.slice().reverse();
	const clientReferrals = sortedReferrals.map( ( referral ) => {
		const purchases = referral.products.map( ( product ) => ( {
			...product,
			referral_id: referral.id,
		} ) );

		return {
			id: referral.client.id,
			client: referral.client,
			purchases,
			purchaseStatuses: purchases.map( ( purchase ) => purchase.status ),
			referralStatuses: [ referral.status ],
			referrals: [ referral ],
		};
	} );

	const reducedReferrals = clientReferrals.reduce( ( acc: Referral[], current ) => {
		const existing = acc.find( ( item ) => item.id === current.id );
		if ( existing ) {
			existing.purchases.push( ...current.purchases );
			existing.purchaseStatuses.push( ...current.purchaseStatuses );
			existing.referralStatuses.push( ...current.referralStatuses );
			existing.referrals.push( ...current.referrals );
		} else {
			acc.push( current );
		}
		return acc;
	}, [] );

	// Move referrals with all archived statuses to end of list
	return reducedReferrals.sort( ( a, b ) => {
		const aAllArchived = a.referralStatuses.every( ( status ) => status === 'archived' );
		const bAllArchived = b.referralStatuses.every( ( status ) => status === 'archived' );

		if ( aAllArchived && ! bAllArchived ) {
			return 1;
		}
		if ( ! aAllArchived && bAllArchived ) {
			return -1;
		}
		return 0;
	} );
};

export default function useFetchReferrals() {
	const agencyId = useSelector( getActiveAgencyId );

	const data = useQuery( {
		queryKey: getReferralsQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		select: getClientReferrals,
	} );

	return data;
}
