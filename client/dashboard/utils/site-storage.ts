import type { SiteMediaStorage } from '../data/types';

const ALERT_PERCENT = 80;

export function getStorageAlertLevel( {
	storage_used_bytes,
	max_storage_bytes,
}: SiteMediaStorage ): 'none' | 'low' | 'exceeded' {
	const storageUsagePercent = Math.round(
		( ( storage_used_bytes / max_storage_bytes ) * 1000 ) / 10
	);

	if ( storageUsagePercent > 100 ) {
		return 'exceeded';
	} else if ( storageUsagePercent > ALERT_PERCENT ) {
		return 'low';
	}
	return 'none';
}
