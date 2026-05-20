import { wpcom } from '../wpcom-fetcher';
import type { ApmAggregateParams, ApmAggregateResponse } from './types';

export async function fetchSiteApmAggregate(
	siteId: number,
	params?: ApmAggregateParams
): Promise< ApmAggregateResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/hosting/apm/aggregate`,
			apiNamespace: 'wpcom/v2',
		},
		params ?? {}
	);
}
