import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getReferralCommissionPayoutQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referral-commission-payout', agencyId ];
};

export default function useGetReferralCommissionPayout() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getReferralCommissionPayoutQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals/commission-payout`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
