import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface CommissionsResponse {
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

export const getCommissionsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-referrals-commissions', agencyId ];
};

export default function useFetchCommissions(): UseQueryResult< CommissionsResponse, unknown > {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getCommissionsQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/referrals/commission-payout`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
