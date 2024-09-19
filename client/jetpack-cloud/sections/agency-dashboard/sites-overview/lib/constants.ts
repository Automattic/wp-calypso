import {
	FEATURE_TYPE_JETPACK_BACKUP,
	FEATURE_TYPE_JETPACK_SCAN,
} from '@automattic/calypso-products';

/**
 * Maps general product types to the more specific corresponding slug that's
 * available for purchase from the dashboard.
 */
export const DASHBOARD_PRODUCT_SLUGS_BY_TYPE: Record< string, string > = {
	backup: 'jetpack-backup-t1',
	boost: 'jetpack-boost',
	scan: 'jetpack-scan',
	monitor: 'jetpack-monitor',
};

export const FEATURE_TYPES_BY_TYPE: Record< string, string > = {
	backup: FEATURE_TYPE_JETPACK_BACKUP,
	scan: FEATURE_TYPE_JETPACK_SCAN,
};

export const WPCOM_HOSTING = 'wpcom-hosting';
