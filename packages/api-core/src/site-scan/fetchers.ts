import { wpcom } from '../wpcom-fetcher';
import type { SiteScan, SiteScanHistory, SiteScanCounts, FixThreatsStatusResponse } from './types';

export async function fetchFixThreatsStatus(
	siteId: number,
	threatIds: number[]
): Promise< FixThreatsStatusResponse > {
	const params = new URLSearchParams();
	threatIds.forEach( ( threatId ) => {
		params.append( 'threat_ids[]', threatId.toString() );
	} );

	return wpcom.req.get( {
		path: `/sites/${ siteId }/alerts/fix?${ params.toString() }`,
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

export async function fetchSiteScanCounts( siteId: number ): Promise< SiteScanCounts > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/scan/counts`,
		apiNamespace: 'wpcom/v2',
	} );
}
