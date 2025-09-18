import { wpcom } from '../wpcom-fetcher';
import type { SiteScan, SiteScanHistory } from './types';

export function enqueueSiteScan( siteId: number ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/scan/enqueue`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteScan( siteId: number ): Promise< SiteScan > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/scan`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSiteScanHistory( siteId: number ): Promise< SiteScanHistory > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/scan/history`,
		apiNamespace: 'wpcom/v2',
	} );
}
