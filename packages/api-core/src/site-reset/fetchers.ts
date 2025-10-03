import { wpcom } from '../wpcom-fetcher';
import type { SiteResetContentSummary, SiteResetStatus } from './types';

export async function fetchSiteResetContentSummary(
	siteId: number
): Promise< SiteResetContentSummary > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reset-site/content-summary`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteResetStatus( siteId: number ): Promise< SiteResetStatus > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reset-site/status`,
		apiNamespace: 'wpcom/v2',
	} );
}
