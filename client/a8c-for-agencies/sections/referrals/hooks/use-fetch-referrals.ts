import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Referral, ReferralAPIResponse } from '../types';

export const getReferralsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referrals', agencyId ];
};

const getClientReferrals = ( referrals: ReferralAPIResponse[] ) => {
	const clients = referrals.reduce< { [ key: string ]: Referral } >( ( acc, referral ) => {
		const purchases = referral.products.map( ( product ) => ( {
			...product,
			referral_id: referral.id, // referral id is needed for the purchase to be unique
		} ) );
		const statuses = purchases.map( ( purchase ) => purchase.status );
		if ( ! acc[ referral.client.id ] ) {
			acc[ referral.client.id ] = {
				// id is a combination of client id and referral id to make it unique
				id: `${ referral.client.id }${ referral.id }`,
				client: referral.client,
				purchases: [ ...purchases ],
				commissions: referral.commission,
				statuses: [ ...statuses ],
			};
		} else {
			acc[ referral.client.id ].purchases.push( ...purchases );
			acc[ referral.client.id ].commissions += referral.commission;
			acc[ referral.client.id ].statuses.push( ...statuses );
		}
		return acc;
	}, {} );

	return Object.values( clients );
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
