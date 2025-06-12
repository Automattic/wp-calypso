import wpcom from 'calypso/lib/wp';

export interface DefensiveModeSettings {
	enabled: boolean;
	enabled_by_a11n: boolean;
	enabled_until: number;
}

export interface DefensiveModeSettingsUpdate {
	active: boolean;
	ttl?: number;
}

export async function fetchEdgeCacheStatus( siteId: number ): Promise< boolean > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/active`,
		apiNamespace: 'wpcom/v2',
	} );
}

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

export async function fetchEdgeCacheDefensiveModeSettings(
	siteId: number
): Promise< DefensiveModeSettings > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/hosting/edge-cache/defensive-mode`,
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
