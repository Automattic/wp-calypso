import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AmplifyJob, AmplifyJobsResponse } from './types';

// While any job is still `pending`, poll so a freshly-submitted run reflects
// its status changes. Once nothing is pending — the remaining jobs are
// `failed`, and completed runs have moved to the reports list — polling stops.
const POLL_INTERVAL = 15 * 1000;

export const getAmplifyJobsQueryKey = ( agencyId?: number ) => [ 'a4a-amplify-jobs', agencyId ];

export function hasPendingJobs( jobs?: AmplifyJob[] ): boolean {
	return !! jobs?.some( ( job ) => job.status === 'pending' );
}

function fetchAmplifyJobs( agencyId: number ): Promise< AmplifyJob[] > {
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/amplify/jobs`,
		} )
		.then( ( response: AmplifyJobsResponse ) => response.jobs );
}

export default function useFetchAmplifyJobs() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AmplifyJob[] >( {
		queryKey: getAmplifyJobsQueryKey( agencyId ),
		queryFn: () => fetchAmplifyJobs( agencyId as number ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) => ( hasPendingJobs( query.state.data ) ? POLL_INTERVAL : false ),
	} );
}
