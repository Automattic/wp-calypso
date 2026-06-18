import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getAmplifyJobsQueryKey } from './use-fetch-amplify-jobs';
import type {
	AmplifyAnalysisRun,
	AmplifyApiError,
	AmplifyJob,
	StartAmplifyAnalysisParams,
} from './types';

function startAmplifyAnalysis(
	params: StartAmplifyAnalysisParams,
	agencyId: number
): Promise< AmplifyAnalysisRun > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/amplify/reports`,
		body: { url: params.url, mode: params.mode },
	} );
}

export default function useStartAmplifyAnalysis< TContext = unknown >(
	options?: UseMutationOptions<
		AmplifyAnalysisRun,
		AmplifyApiError,
		StartAmplifyAnalysisParams,
		TContext
	>
): UseMutationResult< AmplifyAnalysisRun, AmplifyApiError, StartAmplifyAnalysisParams, TContext > {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< AmplifyAnalysisRun, AmplifyApiError, StartAmplifyAnalysisParams, TContext >( {
		...options,
		mutationFn: ( params ) => {
			if ( ! agencyId ) {
				return Promise.reject( {
					status: 400,
					code: 'no_active_agency',
					message: 'No active agency in context.',
				} as AmplifyApiError );
			}
			return startAmplifyAnalysis( params, agencyId );
		},
		onSuccess: ( data, variables, context ) => {
			// Seed the jobs cache with the new pending run so its row appears
			// immediately and the jobs query starts polling (its refetchInterval
			// keys off the presence of a pending job) — without waiting for a
			// manual page refresh. We seed rather than only invalidate because the
			// server's /jobs list may not reflect the run on an immediate refetch.
			queryClient.setQueryData< AmplifyJob[] >(
				getAmplifyJobsQueryKey( agencyId ),
				( previous ) => {
					const existing = previous ?? [];
					return existing.some( ( job ) => job.id === data.id ) ? existing : [ data, ...existing ];
				}
			);
			options?.onSuccess?.( data, variables, context );
		},
	} );
}
