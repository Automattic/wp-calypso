import { wpcom } from '../wpcom-fetcher';
import type { MeFlexUsageResponse } from './types';

export type MeFlexUsageParams = {
	start: number;
	end: number;
	resolution?: 'hour' | 'day' | 'month';
	forecast?: boolean;
	topN?: number;
	includeBySite?: boolean;
};

export async function fetchMeFlexUsage(
	params: MeFlexUsageParams
): Promise< MeFlexUsageResponse > {
	return await wpcom.req.get(
		{
			path: '/me/flex-usage',
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}
