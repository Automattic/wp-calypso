import { wpcom } from '../wpcom-fetcher';
import type { BigSkyPluginUpdateRequest, BigSkyPluginResponse } from './types';

export async function updateBigSkyPlugin(
	siteId: number,
	data: BigSkyPluginUpdateRequest
): Promise< BigSkyPluginResponse > {
	return await wpcom.req.post(
		{
			path: `/sites/${ siteId }/big-sky-plugin`,
			apiVersion: '1.1',
		},
		data
	);
}
