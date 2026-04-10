import { wpcom } from '../wpcom-fetcher';
import type { AgencyApiResponse, AgencyBlog } from './types';

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
