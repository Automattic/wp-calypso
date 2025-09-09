import { wpcom } from '../wpcom-fetcher';

export async function fetchP2HubP2s(
	siteId: number,
	options: { limit?: number } = {}
): Promise< { totalItems: number } > {
	return wpcom.req.get(
		{
			path: '/p2/workspace/sites/all',
			apiNamespace: 'wpcom/v2',
		},
		{
			hub_id: siteId,
			...options,
		}
	);
}
