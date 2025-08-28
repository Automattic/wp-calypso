import wpcom from 'calypso/lib/wp';

export type StagingSyncOptions =
	| string[]
	| { types: string; include_paths: string; exclude_paths: string }
	| undefined;

export interface StagingSyncResponse {
	message: string;
}

export async function pushToStaging(
	productionSiteId: number,
	stagingSiteId: number,
	options: StagingSyncOptions
): Promise< StagingSyncResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ productionSiteId }/staging-site/push-to-staging/${ stagingSiteId }`,
			apiNamespace: 'wpcom/v2',
		},
		{ options }
	);
}

export async function pullFromStaging(
	productionSiteId: number,
	stagingSiteId: number,
	options: StagingSyncOptions
): Promise< StagingSyncResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ productionSiteId }/staging-site/pull-from-staging/${ stagingSiteId }`,
			apiNamespace: 'wpcom/v2',
		},
		{ options, allow_woo_sync: 1 }
	);
}
