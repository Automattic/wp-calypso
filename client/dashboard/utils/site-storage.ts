import { formatNumber } from '@automattic/number-formatters';
import type { SiteMediaStorage } from '@automattic/api-core';

const ALERT_FRACTION = 0.8;

const STORAGE_UNITS = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];

type StorageBytes = Pick< SiteMediaStorage, 'storage_used_bytes' | 'max_storage_bytes' >;

export function getStorageAlertLevel( {
	storage_used_bytes,
	max_storage_bytes,
}: StorageBytes ): 'none' | 'warning' | 'exceeded' {
	const storageFraction = storage_used_bytes / max_storage_bytes;

	if ( storageFraction > 1 ) {
		return 'exceeded';
	} else if ( storageFraction > ALERT_FRACTION ) {
		return 'warning';
	}
	return 'none';
}

export function getStorageUsagePercent( {
	storage_used_bytes,
	max_storage_bytes,
}: StorageBytes ): number {
	return Math.round( ( storage_used_bytes / max_storage_bytes ) * 100 );
}

/**
 * Mirrors WordPress core's `size_format()` so storage figures match wp-admin.
 */
export function formatStorage( bytes: number, decimals = 1 ): string {
	let value = Math.max( bytes, 0 );
	let unitIndex = 0;
	while ( value >= 1024 && unitIndex < STORAGE_UNITS.length - 1 ) {
		value /= 1024;
		unitIndex++;
	}
	return `${ formatNumber( value, { decimals } ) } ${ STORAGE_UNITS[ unitIndex ] }`;
}

/**
 * The API reports each environment's half of the plan quota; production and staging split it evenly.
 */
export function getSharedStorageTotal( {
	max_storage_bytes,
}: Pick< SiteMediaStorage, 'max_storage_bytes' > ): number {
	return max_storage_bytes * 2;
}
