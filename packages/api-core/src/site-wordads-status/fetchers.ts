import { wpcom } from '../wpcom-fetcher';
import type { SiteWordadsStatus } from './types';

export async function fetchSiteWordadsStatus( siteId: number ): Promise< SiteWordadsStatus > {
	return wpcom.req.get( `/sites/${ siteId }/wordads/account` );
}
