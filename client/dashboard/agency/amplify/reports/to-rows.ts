import type { AmplifyReportRow } from './types';
import type { AmplifyReport, AmplifyJob } from '@automattic/api-core';

/**
 * Combine finished reports and in-flight/failed jobs into a single row list.
 * Jobs (pending/failed) and reports (completed) are disjoint sets server-side,
 * so no de-duplication is needed.
 */
export function toRows( reports: AmplifyReport[], jobs: AmplifyJob[] ): AmplifyReportRow[] {
	const reportRows: AmplifyReportRow[] = reports.map( ( report ) => ( {
		id: report.id,
		url: report.url,
		agencyName: report.agency_name,
		mode: report.mode,
		timestamp: report.timestamp,
		status: 'completed',
		score: report.score,
		pdfUrl: report.pdf_url,
		failureReason: null,
	} ) );

	const jobRows: AmplifyReportRow[] = jobs.map( ( job ) => ( {
		id: job.id,
		url: job.url,
		agencyName: null,
		mode: job.mode,
		timestamp: job.timestamp,
		status: job.status,
		score: null,
		pdfUrl: null,
		failureReason: job.failure_reason ?? null,
	} ) );

	return [ ...jobRows, ...reportRows ];
}
