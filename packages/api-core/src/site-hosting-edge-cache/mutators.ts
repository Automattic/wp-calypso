import { wpcom } from '../wpcom-fetcher';
import type { DefensiveModeSettings, DefensiveModeSettingsUpdate } from './types';

export async function updateEdgeCacheStatus( siteId: number, active: boolean ): Promise< boolean > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/edge-cache/active`,
			apiNamespace: 'wpcom/v2',
		},
		{ active }
	);
}

export async function clearEdgeCache( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/hosting/edge-cache/purge`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function updateEdgeCacheDefensiveModeSettings(
	siteId: number,
	data: DefensiveModeSettingsUpdate
): Promise< DefensiveModeSettings > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/edge-cache/defensive-mode`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}
