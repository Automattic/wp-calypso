import { wpcom } from '../wpcom-fetcher';

export async function updateApmEnabled( siteId: number, active: boolean ): Promise< boolean > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/hosting/apm`,
			apiNamespace: 'wpcom/v2',
		},
		{ active }
	);
}
