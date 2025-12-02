import { wpcom } from '../wpcom-fetcher';
import type { StagingSyncOptions, StagingSyncResponse } from './types';

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
