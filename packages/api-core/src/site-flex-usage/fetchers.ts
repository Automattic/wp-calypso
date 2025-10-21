import { wpcom } from '../wpcom-fetcher';

export type FlexUsagePoint = { timestamp: string; usage: string; forecast?: number };

export type FlexUsageResponse = {
	_meta: {
		took: number;
		units: { storage: string; compute: string; bandwidth: string; email: string };
		start: string;
		end: string;
		resolution: 'hour' | 'day' | 'month';
	};
	data: {
		storage: FlexUsagePoint[];
		compute: FlexUsagePoint[];
		bandwidth: FlexUsagePoint[];
		email: FlexUsagePoint[];
	};
};

export async function fetchSiteFlexUsage(
	siteId: number,
	params: {
		start: number;
		end: number;
		resolution?: 'hour' | 'day' | 'month';
		forecast?: boolean;
	}
): Promise< FlexUsageResponse > {
	return await wpcom.req.get(
		{
			path: `/sites/${ siteId }/flex-usage`,
			apiNamespace: 'wpcom/v2',
		},
		params
	);
}
