import type { FlexUsagePoint, FlexUsageResponse } from '../site-flex-usage/fetchers';

export type FlexUsageSeries = {
	storage: FlexUsagePoint[];
	bandwidth: FlexUsagePoint[];
	compute: FlexUsagePoint[];
};

export interface MeFlexUsageResponse {
	_meta: FlexUsageResponse[ '_meta' ] & {
		// Optional account-level caps specific to aggregate endpoint
		caps?: { storageBytes?: number; bandwidthBytes?: number; computeHours?: number };
	};
	data: FlexUsageSeries; // account aggregate
	bySite: Record< string, FlexUsageSeries >; // siteId -> series
}
