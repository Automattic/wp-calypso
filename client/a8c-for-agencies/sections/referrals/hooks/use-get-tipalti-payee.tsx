import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getGetTipaltiPayeeQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-tipalti-payee', agencyId ];
};

const showDummyData = true;

export default function useGetTipaltiPayee() {
	const agencyId = useSelector( getActiveAgencyId );

	const data = useQuery( {
		queryKey: getGetTipaltiPayeeQueryKey( agencyId ),
		queryFn: () =>
			showDummyData
				? {
						status: 'ACTIVE',
						isPayable: false,
						statusReason: 'Tax forms not provided, No payment method selected',
				  }
				: wpcom.req.get( {
						apiNamespace: 'wpcom/v2',
						path: `agency/${ agencyId }/tipalti-payee`,
				  } ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );

	return data;
}
