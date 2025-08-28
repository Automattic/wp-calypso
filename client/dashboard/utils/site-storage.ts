import type { SiteMediaStorage } from '../data/types';

const ALERT_FRACTION = 0.8;

export function getStorageAlertLevel( {
	storage_used_bytes,
	max_storage_bytes,
}: SiteMediaStorage ): 'none' | 'warning' | 'exceeded' {
	const storageFraction = storage_used_bytes / max_storage_bytes;

	if ( storageFraction > 1 ) {
		return 'exceeded';
	} else if ( storageFraction > ALERT_FRACTION ) {
		return 'warning';
	}
	return 'none';
}
