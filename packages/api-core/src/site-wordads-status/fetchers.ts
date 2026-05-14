import { wpcom } from '../wpcom-fetcher';
import type { WordadsStatus } from './types';

export async function fetchSiteWordadsStatus( siteId: number ): Promise< WordadsStatus > {
	return wpcom.req.get( `/sites/${ siteId }/wordads/account` );
}
