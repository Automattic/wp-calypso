import { wpcom } from '../wpcom-fetcher';
import type { AgencyBlog } from './types';

export async function fetchAgencyBlog( siteId: number ): Promise< AgencyBlog > {
	return wpcom.req.get( {
		path: `/agency/blog/${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );
}
