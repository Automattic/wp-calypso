import { wpcom } from '../wpcom-fetcher';
import type { BlockedSite } from './types';

export async function fetchBlockedSites( page: number, perPage: number ): Promise< BlockedSite[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/blocks/sites',
			apiNamespace: 'wpcom/v2',
		},
		{
			page,
			per_page: perPage,
		}
	);

	return sites;
}
