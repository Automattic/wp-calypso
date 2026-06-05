import { wpcom } from '../wpcom-fetcher';
import type { AgencyApiResponse, AgencyBlog, AgencyResourcesResponse } from './types';

export async function fetchAgency(): Promise< AgencyApiResponse > {
	return wpcom.req.get( {
		path: '/agency',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchAgencyResources(): Promise< AgencyResourcesResponse > {
	return wpcom.req.get( {
		path: '/agency/resources',
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
