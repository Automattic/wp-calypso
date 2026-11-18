import {
	archiveAmplifyReport,
	fetchAmplifyReports,
	retryAmplifyReport,
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

/** Updates the cached report list, then refetches it so usage stays current. */
function updateCachedReports(
	agencyId: number,
	update: ( reports: AmplifyReport[] ) => AmplifyReport[]
) {
	const { queryKey } = amplifyReportsQuery( agencyId );
	queryClient.setQueryData< AmplifyReportsResponse >( queryKey, ( previous ) =>
		previous ? { ...previous, reports: update( previous.reports ) } : previous
	);
	queryClient.invalidateQueries( { queryKey } );
}

export const startAmplifyReportMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationKey: [ 'agency', agencyId, 'amplify', 'reports', 'start' ],
		meta: { statId: 'agcy-amplify-report-create' },
		mutationFn: ( input: StartAmplifyReportInput ) => startAmplifyReport( agencyId, input ),
		onSuccess: ( report ) =>
			updateCachedReports( agencyId, ( reports ) => [
				report,
				...reports.filter( ( item ) => item.id !== report.id ),
			] ),
	} );

export const archiveAmplifyReportMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationKey: [ 'agency', agencyId, 'amplify', 'reports', 'archive' ],
		meta: { statId: 'agcy-amplify-report-archive' },
		mutationFn: ( reportId: string ) => archiveAmplifyReport( agencyId, reportId ),
		onSuccess: ( _report, reportId ) =>
			updateCachedReports( agencyId, ( reports ) =>
				reports.filter( ( item ) => item.id !== reportId )
			),
	} );

export const retryAmplifyReportMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationKey: [ 'agency', agencyId, 'amplify', 'reports', 'retry' ],
		meta: { statId: 'agcy-amplify-report-retry' },
		mutationFn: ( reportId: string ) => retryAmplifyReport( agencyId, reportId ),
		onSuccess: ( report ) =>
			updateCachedReports( agencyId, ( reports ) =>
				reports.map( ( item ) => ( item.id === report.id ? report : item ) )
			),
	} );
