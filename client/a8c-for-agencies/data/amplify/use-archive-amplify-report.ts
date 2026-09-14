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
import type { AmplifyApiError, AmplifyReport, ArchiveAmplifyReportParams } from './types';

function archiveAmplifyReport( reportId: string, agencyId: number ): Promise< AmplifyReport > {
	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }`,
		body: { archived: true },
	} );
}

export default function useArchiveAmplifyReport< TContext = unknown >(
	options?: UseMutationOptions<
		AmplifyReport,
		AmplifyApiError,
		ArchiveAmplifyReportParams,
		TContext
	>
): UseMutationResult< AmplifyReport, AmplifyApiError, ArchiveAmplifyReportParams, TContext > {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< AmplifyReport, AmplifyApiError, ArchiveAmplifyReportParams, TContext >( {
		...options,
		mutationFn: ( params ) => {
			if ( ! agencyId ) {
				return Promise.reject( {
					status: 400,
					code: 'no_active_agency',
					message: 'No active agency in context.',
				} as AmplifyApiError );
			}
			return archiveAmplifyReport( params.reportId, agencyId );
		},
		onSuccess: ( data, variables, context ) => {
			// The reports collection excludes archived reports, so drop the row
			// from the cache right away instead of waiting for a refetch.
			queryClient.setQueryData< AmplifyReport[] >(
				getAmplifyReportsQueryKey( agencyId ),
				( previous ) => previous?.filter( ( report ) => report.id !== data.id )
			);
			options?.onSuccess?.( data, variables, context );
		},
	} );
}
