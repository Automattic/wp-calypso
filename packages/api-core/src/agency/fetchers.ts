import { wpcom } from '../wpcom-fetcher';
import type {
	AgencyApiResponse,
	AgencyBlog,
	AmplifyReport,
	AmplifyJob,
	AmplifyAnalysisRun,
	AmplifyReportsResponse,
	AmplifyJobsResponse,
	SubmitAmplifyAnalysisParams,
} from './types';

export async function fetchAgency(): Promise< AgencyApiResponse > {
	return wpcom.req.get( {
		path: '/agency',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchAgencyBlog( siteId: number ): Promise< AgencyBlog > {
	return wpcom.req.get( {
		path: `/agency/blog/${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}

/**
 * Fetches the "schedule a call" link for the growth accelerator card.
 * Returns a URL string the client opens in a new tab.
 */
export async function fetchAgencyScheduleCallLink( agencyId: number ): Promise< string > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/schedule-call-link`,
		apiNamespace: 'wpcom/v2',
	} );
}

/**
 * Lists all finished Amplify reports for the agency. Every agency member sees
 * the full set; the server scopes by the agency_id in the path.
 */
export async function fetchAmplifyReports( agencyId: number ): Promise< AmplifyReport[] > {
	const data: AmplifyReportsResponse = await wpcom.req.get( {
		path: `/agency/${ agencyId }/amplify/reports`,
		apiNamespace: 'wpcom/v2',
	} );
	return data.reports;
}

/**
 * Lists the agency's in-flight (pending) and failed Amplify runs. Completed
 * runs leave this list and appear in fetchAmplifyReports after an index lag.
 */
export async function fetchAmplifyJobs( agencyId: number ): Promise< AmplifyJob[] > {
	const data: AmplifyJobsResponse = await wpcom.req.get( {
		path: `/agency/${ agencyId }/amplify/jobs`,
		apiNamespace: 'wpcom/v2',
	} );
	return data.jobs;
}

/**
 * Starts an asynchronous Amplify analysis. Returns the 202 run object whose
 * `id` is the Trigger.dev run id (correlate via fetchAmplifyJobs).
 */
export async function submitAmplifyAnalysis(
	agencyId: number,
	params: SubmitAmplifyAnalysisParams
): Promise< AmplifyAnalysisRun > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/amplify/reports`,
		apiNamespace: 'wpcom/v2',
		body: {
			url: params.url,
			mode: params.mode,
		},
	} );
}
