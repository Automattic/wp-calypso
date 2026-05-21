import { wpcom } from '../wpcom-fetcher';
import type { SiteMcpAbilitiesResponse, SiteMcpAbilitiesUpdateRequest } from './types';

export async function updateSiteMcpAbilities(
	siteId: number,
	data: SiteMcpAbilitiesUpdateRequest
): Promise< SiteMcpAbilitiesResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/mcp-abilities`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}
