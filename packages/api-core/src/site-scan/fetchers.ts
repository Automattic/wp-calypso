import { wpcom } from '../wpcom-fetcher';
import type { SiteScan } from './types';

export async function fetchSiteScan( siteId: number ): Promise< SiteScan > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/scan`,
		apiNamespace: 'wpcom/v2',
	} );
}
