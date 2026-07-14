import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
	UseMutationResult,
} from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getAmplifyReportsQueryKey } from './use-fetch-amplify-reports';
import type { AmplifyApiError, AmplifyReport, StartAmplifyAnalysisParams } from './types';

function startAmplifyAnalysis(
	params: StartAmplifyAnalysisParams,
	agencyId: number
): Promise< AmplifyReport > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/amplify/reports`,
		body: { url: params.url, mode: params.mode },
	} );
}

export default function useStartAmplifyAnalysis< TContext = unknown >(
	options?: UseMutationOptions<
		AmplifyReport,
		AmplifyApiError,
		StartAmplifyAnalysisParams,
		TContext
	>
): UseMutationResult< AmplifyReport, AmplifyApiError, StartAmplifyAnalysisParams, TContext > {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< AmplifyReport, AmplifyApiError, StartAmplifyAnalysisParams, TContext >( {
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
			// Seed the reports cache with the new `in_progress` report so its row
			// appears immediately and the reports query starts polling (its
			// refetchInterval keys off the presence of an in-progress report) —
			// without waiting for a manual page refresh. We seed rather than only
			// invalidate so the row shows even if a refetch races the write.
			queryClient.setQueryData< AmplifyReport[] >(
				getAmplifyReportsQueryKey( agencyId ),
				( previous ) => {
					const existing = previous ?? [];
					return existing.some( ( report ) => report.id === data.id )
						? existing
						: [ data, ...existing ];
				}
			);
			options?.onSuccess?.( data, variables, context );
		},
	} );
}
