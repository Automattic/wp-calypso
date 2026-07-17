import { useMemo } from 'react';
import useFetchAmplifyReports from 'calypso/a8c-for-agencies/data/amplify/use-fetch-amplify-reports';
import type {
	AmplifyMode,
	AmplifyReport,
	AmplifyReportStatus,
} from 'calypso/a8c-for-agencies/data/amplify/types';

// One row per report for the reports table. The unified /reports collection
// carries every status, so in-flight and failed runs need no separate source.
export interface AmplifyReportRow {
	id: string;
	url: string;
	mode: AmplifyMode;
	timestamp: string;
	rowStatus: AmplifyReportStatus;
	humanScore: number | null;
	aiScore: number | null;
	pdfUrl: string | null;
	failureReason?: string;
}

// Pure so it stays testable in isolation from react-query. The returned order
// doesn't matter for display — the table sorts every row by timestamp.
export function toAmplifyReportRows( reports: AmplifyReport[] = [] ): AmplifyReportRow[] {
	return reports.map( ( report ) => ( {
		id: report.id,
		url: report.url,
		mode: report.mode,
		timestamp: report.created_at ?? '',
		rowStatus: report.status,
		humanScore: report.score.human,
		aiScore: report.score.ai,
		pdfUrl: report.pdf_url || null,
		failureReason: report.failure_reason ?? undefined,
	} ) );
}

export default function useAmplifyReportRows(): {
	rows: AmplifyReportRow[];
	isLoading: boolean;
	error: unknown;
} {
	// Polls every 15s while any report is `in_progress` (see
	// use-fetch-amplify-reports), so a running analysis flips to its terminal
	// status without a refresh.
	const reportsQuery = useFetchAmplifyReports();

	const rows = useMemo( () => toAmplifyReportRows( reportsQuery.data ), [ reportsQuery.data ] );

	return {
		rows,
		isLoading: reportsQuery.isLoading,
		error: reportsQuery.error,
	};
}
