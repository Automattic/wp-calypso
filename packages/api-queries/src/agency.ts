import {
	fetchAgency,
	fetchAgencyScheduleCallLink,
	fetchAmplifyReports,
	fetchAmplifyJobs,
	submitAmplifyAnalysis,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { Agency, SubmitAmplifyAnalysisParams } from '@automattic/api-core';

type AgencyQueryResult = {
	isClientUser: boolean;
	hasAgency: boolean;
};

export const agencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency' ] as const,
		queryFn: async () => {
			const data = await fetchAgency();
			let agency: AgencyQueryResult;

			if ( Array.isArray( data ) ) {
				agency = { isClientUser: false, hasAgency: data.length > 0 };
			} else {
				agency = {
					isClientUser: !! data.is_client_user,
					hasAgency: false,
				};
			}

			return agency;
		},
		// Agency membership rarely changes within a session, so we avoid
		// refetching on every mount, focus, and route-guard check.
		staleTime: 5 * 60 * 1000,
	} );

/**
 * Returns the active agency (the first one returned by the API), or null when
 * the current user is not an agency user.
 */
export const activeAgencyQuery = () =>
	queryOptions( {
		queryKey: [ 'agency', 'active' ] as const,
		queryFn: async (): Promise< Agency | null > => {
			const data = await fetchAgency();
			if ( Array.isArray( data ) ) {
				return data[ 0 ] ?? null;
			}
			return null;
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );

/**
 * Lazily fetches the growth-accelerator "schedule a call" link for an agency.
 * Disabled by default; trigger with `refetch()` on user interaction.
 */
export const agencyScheduleCallLinkQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'schedule-call-link' ] as const,
		queryFn: () => fetchAgencyScheduleCallLink( agencyId ),
		enabled: false,
		staleTime: 5 * 60 * 1000,
		retry: false,
	} );

/** All finished Amplify reports for the agency. */
export const amplifyReportsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'amplify', 'reports' ] as const,
		queryFn: () => fetchAmplifyReports( agencyId ),
	} );

/**
 * The agency's in-flight/failed Amplify runs. Polls every 15s while any job is
 * still pending, then stops — completed runs move to the reports list.
 */
export const amplifyJobsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'amplify', 'jobs' ] as const,
		queryFn: () => fetchAmplifyJobs( agencyId ),
		refetchInterval: ( query ) =>
			query.state.data?.some( ( job ) => job.status === 'pending' ) ? 15_000 : false,
	} );

/**
 * Submits a new Amplify analysis. On success the run shows up as a pending job,
 * so the jobs query is invalidated to surface it immediately.
 */
export const submitAmplifyAnalysisMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( params: SubmitAmplifyAnalysisParams ) =>
			submitAmplifyAnalysis( agencyId, params ),
		onSuccess: () => {
			queryClient.invalidateQueries( amplifyJobsQuery( agencyId ) );
		},
	} );
