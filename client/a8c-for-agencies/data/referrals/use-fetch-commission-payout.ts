import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface CommissionPayoutResponse {
	total_amount: number;
	total_commission: number;
	client_data: Array< {
		client_user_id: number;
		email: string;
		total_amount: number;
		total_commission: number;
		products: Array< {
			product_name: string;
			total_amount: number;
			total_commission: number;
		} >;
	} >;
}

export const getCommissionPayoutQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referrals-commission-payout', agencyId ];
};

export default function useFetchCommissionPayout(): UseQueryResult<
	CommissionPayoutResponse,
	unknown
> {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getCommissionPayoutQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals/commission-payout`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
