import { wpcom } from '../wpcom-fetcher';
import type { AgencySiteWithPlugin } from './types';

export async function fetchAgencySitesWithPlugins(
	agencyId: number,
	plugins: string[]
): Promise< AgencySiteWithPlugin[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ agencyId }/sites`,
		},
		{
			filters: {
				plugins,
			},
		}
	);
}
