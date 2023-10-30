import type { StorageOption, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type Props = {
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null;
	storageOptions?: StorageOption[];
};

/**
 * Returns the storage add-on upsell option to display to
 * the user on initial load. If the user has purchased a
 * storage add-on, that will be the default. Otherwise,
 * the storage included with any given plan will be used.
 *
 */
export default function useDefaultStorageOption( { storageOptions, storageAddOnsForPlan }: Props ) {
	const [ purchasedStorageAddOnSlug ]: [ WPComStorageAddOnSlug ] =
		( storageAddOnsForPlan?.find( ( storageAddOn ) => storageAddOn?.purchased )?.featureSlugs as [
			WPComStorageAddOnSlug,
		] ) ?? [];

	return (
		purchasedStorageAddOnSlug ||
		storageOptions?.find( ( storageOption ) => ! storageOption.isAddOn )?.slug
	);
}
