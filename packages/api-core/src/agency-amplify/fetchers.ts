import { wpcom } from '../wpcom-fetcher';
import type { AmplifyReport, AmplifyReportsResponse } from './types';

export async function fetchAmplifyReports( agencyId: number ): Promise< AmplifyReportsResponse > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/amplify/reports`,
		apiNamespace: 'wpcom/v2',
	} );
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
