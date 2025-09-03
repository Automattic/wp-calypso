import { wpcom } from '../wpcom-fetcher';
import type { StagingSite } from './types';

export async function fetchStagingSiteOf(
	productionSiteId: number
): Promise< Array< StagingSite > > {
	return wpcom.req.get( {
		path: `/sites/${ productionSiteId }/staging-site`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchStagingSiteSyncState( siteId: number ) {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/staging-site/sync-state`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function validateQuota( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/staging-site/validate-quota`,
		apiNamespace: 'wpcom/v2',
	} );
}
