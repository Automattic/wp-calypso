import { wpcom } from '../wpcom-fetcher';
import type { SiteHealth } from './types';

export async function fetchSiteHealth( siteId: number ): Promise< SiteHealth > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/dashboard/site-health`,
		apiNamespace: 'wpcom/v2',
	} );
}
