import {
	archiveAmplifyReport,
	fetchAmplifyReports,
	startAmplifyReport,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type {
	AmplifyReport,
	AmplifyReportsResponse,
	StartAmplifyReportInput,
} from '@automattic/api-core';

export function hasActiveAmplifyReports( reports?: AmplifyReport[] ): boolean {
	return !! reports?.some(
		( report ) => report.status === 'pending' || report.status === 'in_progress'
	);
}

export const amplifyReportsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'amplify', 'reports' ] as const,
		queryFn: () => fetchAmplifyReports( agencyId ),
		enabled: !! agencyId,
		refetchInterval: ( query ) =>
			hasActiveAmplifyReports( query.state.data?.reports ) ? 15_000 : false,
	} );

export const startAmplifyReportMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-amplify-report-create' },
		mutationFn: ( input: StartAmplifyReportInput ) => startAmplifyReport( agencyId, input ),
		onSuccess: ( report ) => {
			queryClient.setQueryData< AmplifyReportsResponse >(
				amplifyReportsQuery( agencyId ).queryKey,
				( previous ) => ( {
					...previous,
					reports: [
						report,
						...( previous?.reports ?? [] ).filter( ( item ) => item.id !== report.id ),
					],
				} )
			);
			queryClient.invalidateQueries( { queryKey: amplifyReportsQuery( agencyId ).queryKey } );
		},
	} );

export const archiveAmplifyReportMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-amplify-report-archive' },
		mutationFn: ( reportId: string ) => archiveAmplifyReport( agencyId, reportId ),
		onSuccess: ( report ) => {
			queryClient.setQueryData< AmplifyReportsResponse >(
				amplifyReportsQuery( agencyId ).queryKey,
				( previous ) =>
					previous
						? { ...previous, reports: previous.reports.filter( ( item ) => item.id !== report.id ) }
						: previous
			);
			queryClient.invalidateQueries( { queryKey: amplifyReportsQuery( agencyId ).queryKey } );
		},
	} );
