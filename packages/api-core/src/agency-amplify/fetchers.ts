import { wpcom } from '../wpcom-fetcher';
import type { AmplifyReport, AmplifyReportPdf, AmplifyReportsResponse } from './types';

export async function fetchAmplifyReports( agencyId: number ): Promise< AmplifyReportsResponse > {
	return wpcom.req.get(
		{
			path: `/agency/${ agencyId }/amplify/reports`,
			apiNamespace: 'wpcom/v2',
		},
		{ per_page: 100 }
	);
}

export async function fetchAmplifyReport(
	agencyId: number,
	reportId: string
): Promise< AmplifyReport > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }`,
		apiNamespace: 'wpcom/v2',
	} );
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
