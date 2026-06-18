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
import type { AmplifyAnalysisRun, AmplifyApiError, StartAmplifyAnalysisParams } from './types';

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
			// A new run starts as `pending`; refresh the jobs list so it surfaces
			// immediately (and polling picks up from there).
			queryClient.invalidateQueries( { queryKey: getAmplifyJobsQueryKey( agencyId ) } );
			options?.onSuccess?.( data, variables, context );
		},
	} );
}
