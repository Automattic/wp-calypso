import { wpcom } from '../wpcom-fetcher';
import type { AmplifyReportPdf, AmplifyReportsResponse } from './types';

const REPORTS_PER_PAGE = 100;

export async function fetchAmplifyReports( agencyId: number ): Promise< AmplifyReportsResponse > {
	const fetchPage = ( page: number ): Promise< AmplifyReportsResponse > =>
		wpcom.req.get(
			{
				path: `/agency/${ agencyId }/amplify/reports`,
				apiNamespace: 'wpcom/v2',
			},
			{ page, per_page: REPORTS_PER_PAGE }
		);

	const first = await fetchPage( 1 );
	const reports = [ ...first.reports ];
	let last = first.reports;
	for ( let page = 2; last.length === REPORTS_PER_PAGE; page++ ) {
		last = ( await fetchPage( page ) ).reports;
		reports.push( ...last );
	}
	return { ...first, reports };
}

export async function fetchAmplifyReportPdf(
	agencyId: number,
	reportId: string
): Promise< AmplifyReportPdf > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }/pdf`,
		apiNamespace: 'wpcom/v2',
	} );
}
