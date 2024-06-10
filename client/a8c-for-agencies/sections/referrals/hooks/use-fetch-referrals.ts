import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Referral, ReferralAPIResponse } from '../types';

export const getReferralsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referrals', agencyId ];
};

const getClientReferrals = ( referrals: ReferralAPIResponse[] ) => {
	const clients: Referral[] = [];
	referrals.forEach( ( referral ) => {
		const clientIndex = clients.findIndex( ( client ) => client.client_id === referral.client_id );
		if ( clientIndex === -1 ) {
			clients.push( {
				id: referral.id,
				client_id: referral.client_id,
				client_email: referral.client_email,
				purchases: [ ...referral.products ],
				commissions: referral.commission,
				statuses: [ referral.status ],
			} );
		} else {
			clients[ clientIndex ].purchases.push( ...referral.products );
			clients[ clientIndex ].commissions += referral.commission;
			clients[ clientIndex ].statuses.push( referral.status );
		}
	} );
	return clients;
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
