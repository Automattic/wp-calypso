import type { StorageOption } from '@automattic/calypso-products';
import type { AddOnMeta } from '@automattic/data-stores';

type Props = {
	storageAddOnsForPlan: ( AddOnMeta | null )[] | null;
	storageOptions: StorageOption[];
};

export default function useDefaultStorageOption( { storageOptions, storageAddOnsForPlan }: Props ) {
	const [ purchasedStorageAddOn ] =
		storageAddOnsForPlan?.find( ( storageAddOn ) => storageAddOn?.purchased )?.featureSlugs ?? [];

	const defaultStorageOption =
		purchasedStorageAddOn ||
		storageOptions?.find( ( storageOption ) => ! storageOption.isAddOn )?.slug;

	return defaultStorageOption;
}
