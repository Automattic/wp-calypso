import type { StorageOption } from '@automattic/calypso-products';

/**
 * Don't show storage add-on-upsells for:
 *  - the enterprise plan which has no storage options
 * 	- plans that only have 1 default storage option ( and no upgrades )
 *  - monthly or multi-year plans
 *  - environments with a disabled feature flag
 */
export const isStorageUpgradeableForPlan = ( {
	intervalType,
	showUpgradeableStorage,
	storageOptions,
}: {
	intervalType: string;
	showUpgradeableStorage: boolean;
	storageOptions: StorageOption[];
} ) => storageOptions.length > 1 && intervalType === 'yearly' && showUpgradeableStorage;
