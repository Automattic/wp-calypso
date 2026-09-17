import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AmplifyReport, AmplifyReportsResponse } from './types';

// While any report is still `pending` or `in_progress`, poll so a queued or
// running analysis flips to its terminal status (`completed` / `failed`)
// without a manual refresh.
const POLL_INTERVAL = 15 * 1000;

export const getAmplifyReportsQueryKey = ( agencyId?: number ) => [
	'a4a-amplify-reports',
	agencyId,
];

export function hasActiveReports( reports?: AmplifyReport[] ): boolean {
	return !! reports?.some(
		( report ) => report.status === 'pending' || report.status === 'in_progress'
	);
}

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
		refetchInterval: ( query ) => ( hasActiveReports( query.state.data ) ? POLL_INTERVAL : false ),
	} );
}
