import { wpcom } from '../wpcom-fetcher';
import type {
	ApmAggregateParams,
	ApmAggregateResponse,
	ApmDetailParams,
	ApmDetailResponse,
} from './types';

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

export async function fetchSiteApmDetail(
	siteId: number,
	params: ApmDetailParams
): Promise< ApmDetailResponse > {
	return wpcom.req.get(
		{
			path: `/sites/${ siteId }/hosting/apm/detail`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}
