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
			referralId: referral.id,
		};
	} );

	return clientReferrals.reduce( ( acc: Referral[], current ) => {
		const existing = acc.find( ( item ) => item.id === current.id );
		if ( existing ) {
			existing.purchases.push( ...current.purchases );
			existing.purchaseStatuses.push( ...current.purchaseStatuses );
			existing.referralStatuses.push( ...current.referralStatuses );
		} else {
			acc.push( current );
		}
		return acc;
	}, [] );
};

export default function useFetchReferrals( isEnabled: boolean ) {
	const agencyId = useSelector( getActiveAgencyId );

	const data = useQuery( {
		queryKey: getReferralsQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals`,
			} ),
		enabled: isEnabled && !! agencyId,
		refetchOnWindowFocus: false,
		select: getClientReferrals,
	} );

	return data;
}
