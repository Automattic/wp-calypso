import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AmplifyReport, AmplifyReportsResponse } from './types';

export const getAmplifyReportsQueryKey = ( agencyId?: number ) => [
	'a4a-amplify-reports',
	agencyId,
];

function fetchAmplifyReports( agencyId: number ): Promise< AmplifyReport[] > {
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/amplify/reports`,
		} )
		.then( ( response: AmplifyReportsResponse ) => response.reports );
}

export default function useFetchAmplifyReports() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AmplifyReport[] >( {
		queryKey: getAmplifyReportsQueryKey( agencyId ),
		queryFn: () => fetchAmplifyReports( agencyId as number ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
