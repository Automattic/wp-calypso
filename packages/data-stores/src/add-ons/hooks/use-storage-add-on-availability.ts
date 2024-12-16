import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { useSiteMediaStorage } from '../../site';
import { AddOnMeta } from '../types';
import { isStorageQuantityAvailable } from './use-available-storage-add-ons';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null;
}

export enum StorageAddOnAvailability {
	NotAStorageAddOn,
	DataLoading,
	Unavailable,
	Available,
}

/**
 * Check if an add-on is a storage add-on, and if so, if the quantity is available for purchase.
 */
export default function useStorageAddOnAvailability( {
	addOnMeta,
	selectedSiteId,
}: Props ): StorageAddOnAvailability {
	const mediaStorage = useSiteMediaStorage( { siteIdOrSlug: selectedSiteId } );

	if ( addOnMeta.productSlug !== PRODUCT_1GB_SPACE ) {
		return StorageAddOnAvailability.NotAStorageAddOn;
	}

	if ( ! mediaStorage.data ) {
		return StorageAddOnAvailability.DataLoading;
	}

	return isStorageQuantityAvailable( addOnMeta.quantity ?? 0, mediaStorage.data )
		? StorageAddOnAvailability.Available
		: StorageAddOnAvailability.Unavailable;
}
