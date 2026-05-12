import { wpcom } from '../wpcom-fetcher';
import type { ApmTraces, ApmTracesParams } from './types';

export async function fetchApmTraces(
	siteId: number,
	params: ApmTracesParams
): Promise< ApmTraces > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/hosting/apm/traces`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}
