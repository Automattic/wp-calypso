import type { RewindPolicies } from 'calypso/state/rewind/policies/types';

type ApiResponse = {
	policies: {
		activity_log_limit_days: number;
		storage_limit_bytes: number;
	} | null;
};

const fromApi = ( { policies }: ApiResponse ): RewindPolicies => ( {
	activityLogLimitDays: policies?.activity_log_limit_days,
	storageLimitBytes: policies?.storage_limit_bytes,
} );

export default fromApi;
