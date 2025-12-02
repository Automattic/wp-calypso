import { wpcom } from '../wpcom-fetcher';
import type { DefensiveModeSettings } from './types';

export async function fetchEdgeCacheStatus( siteId: number ): Promise< boolean > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchEdgeCacheDefensiveModeSettings(
	siteId: number
): Promise< DefensiveModeSettings > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/defensive-mode`,
		apiNamespace: 'wpcom/v2',
	} );
}
