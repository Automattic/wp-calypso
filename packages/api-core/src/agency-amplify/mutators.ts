import { wpcom } from '../wpcom-fetcher';
import type { AmplifyReport, StartAmplifyReportInput } from './types';

export async function startAmplifyReport(
	agencyId: number,
	input: StartAmplifyReportInput
): Promise< AmplifyReport > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/amplify/reports`,
		apiNamespace: 'wpcom/v2',
		body: input,
	} );
}

export async function archiveAmplifyReport(
	agencyId: number,
	reportId: string
): Promise< AmplifyReport > {
	return wpcom.req.put( {
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }`,
		apiNamespace: 'wpcom/v2',
		body: { archived: true },
	} );
}

/**
 * Relaunches a failed report with the same URL and mode, updating the same row.
 */
export async function retryAmplifyReport(
	agencyId: number,
	reportId: string
): Promise< AmplifyReport > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/amplify/reports/${ reportId }/retry`,
		apiNamespace: 'wpcom/v2',
	} );
}
