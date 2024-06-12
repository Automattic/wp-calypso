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
		if ( ! acc[ referral.client_id ] ) {
			acc[ referral.client_id ] = {
				id: referral.id,
				client_id: referral.client_id,
				client_email: referral.client_email,
				purchases: [ ...referral.products ],
				commissions: referral.commission,
				statuses: [ referral.status ],
			};
		} else {
			acc[ referral.client_id ].purchases.push( ...referral.products );
			acc[ referral.client_id ].commissions += referral.commission;
			acc[ referral.client_id ].statuses.push( referral.status );
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
