import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import useFetchAmplifyJobs from 'calypso/a8c-for-agencies/data/amplify/use-fetch-amplify-jobs';
import useFetchAmplifyReports, {
	getAmplifyReportsQueryKey,
} from 'calypso/a8c-for-agencies/data/amplify/use-fetch-amplify-reports';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type {
	AmplifyJob,
	AmplifyMode,
	AmplifyReport,
} from 'calypso/a8c-for-agencies/data/amplify/types';

export type AmplifyRowStatus = 'completed' | 'pending' | 'failed';

// One unified row for the reports table: completed reports (from /reports) and
// in-flight/failed runs (from /jobs) share the columns that matter to the list.
export interface AmplifyReportRow {
	id: string;
	url: string;
	agencyName: string;
	mode: AmplifyMode;
	timestamp: string;
	rowStatus: AmplifyRowStatus;
	humanScore: number | null;
	aiScore: number | null;
	pdfUrl: string | null;
	failureReason?: string;
}

// Pure so it stays testable in isolation from react-query. The returned order
// doesn't matter for display — the table sorts every row by timestamp.
export function mergeAmplifyRows(
	reports: AmplifyReport[] = [],
	jobs: AmplifyJob[] = []
): AmplifyReportRow[] {
	const jobRows: AmplifyReportRow[] = jobs.map( ( job ) => ( {
		id: job.id,
		url: job.url,
		agencyName: '',
		mode: job.mode,
		timestamp: job.timestamp,
		rowStatus: job.status,
		humanScore: null,
		aiScore: null,
		pdfUrl: null,
		failureReason: job.failure_reason,
	} ) );

	const reportRows: AmplifyReportRow[] = reports.map( ( report ) => ( {
		id: report.id,
		url: report.url,
		agencyName: report.agency_name,
		mode: report.mode,
		timestamp: report.timestamp,
		rowStatus: 'completed',
		humanScore: report.score.human,
		aiScore: report.score.ai,
		pdfUrl: report.pdf_url,
	} ) );

	return [ ...jobRows, ...reportRows ];
}

function countPending( jobs: AmplifyJob[] = [] ): number {
	return jobs.filter( ( job ) => job.status === 'pending' ).length;
}

export default function useAmplifyReportRows(): {
	rows: AmplifyReportRow[];
	isLoading: boolean;
	error: unknown;
} {
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );

	const reportsQuery = useFetchAmplifyReports();
	// Polls every 15s while any job is `pending` (see use-fetch-amplify-jobs).
	const jobsQuery = useFetchAmplifyJobs();

	// When a run drops out of /jobs (the pending count falls), it has either
	// completed or failed. Refetch /reports so a finished run's completed row
	// surfaces once the index catches up (there's a lag before it appears).
	const previousPending = useRef( 0 );
	useEffect( () => {
		const pending = countPending( jobsQuery.data );
		if ( pending < previousPending.current ) {
			queryClient.invalidateQueries( { queryKey: getAmplifyReportsQueryKey( agencyId ) } );
		}
		previousPending.current = pending;
	}, [ jobsQuery.data, queryClient, agencyId ] );

	const rows = useMemo(
		() => mergeAmplifyRows( reportsQuery.data, jobsQuery.data ),
		[ reportsQuery.data, jobsQuery.data ]
	);

	return {
		rows,
		isLoading: reportsQuery.isLoading || jobsQuery.isLoading,
		// Jobs errors are non-fatal — completed reports should still render.
		error: reportsQuery.error,
	};
}
