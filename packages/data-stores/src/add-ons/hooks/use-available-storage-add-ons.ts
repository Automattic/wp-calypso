import { useMemo } from '@wordpress/element';
import { SiteMediaStorage, useSiteMediaStorage } from '../../site';
import { STORAGE_LIMIT } from '../constants';
import { AddOnMeta } from '../types';
import useStorageAddOns from './use-storage-add-ons';

interface Props {
	siteId?: number | null;
}

/**
 * Check if the quantity for a storage add-on is available for purchase.
 * @param quantity The number of gigabytes the given add-on adds to the site's storage
 * @param storage Data returned from
 */
export function isStorageQuantityAvailable( quantity: number, storage: SiteMediaStorage ): boolean {
	const existingAddOnStorage = storage.maxStorageBytesFromAddOns / Math.pow( 1024, 3 );
	const currentMaxStorage = storage.maxStorageBytes / Math.pow( 1024, 3 );
	const isWithinStorageLimit = STORAGE_LIMIT >= currentMaxStorage - existingAddOnStorage + quantity;

	return existingAddOnStorage < quantity && isWithinStorageLimit;
}

/**
 * Returns the storage add-ons that are available for purchase considering the current site when present.
 * Conditions:
 * - If the storage add-on does not exceed the site storage limits.
 * - If the quantity of the storage add-on is less than or equal to the available storage upgrade.
 */
const useAvailableStorageAddOns = ( { siteId }: Props ): AddOnMeta[] => {
	const storageAddOns = useStorageAddOns( { siteId } );
	const siteMediaStorage = useSiteMediaStorage( { siteIdOrSlug: siteId } );

	return useMemo( () => {
		const nonNullAddOns = storageAddOns.filter( ( addOn ): addOn is AddOnMeta => addOn !== null );
		const siteMediaStorageData = siteMediaStorage.data;

		if ( ! siteMediaStorageData ) {
			return nonNullAddOns;
		}

		return nonNullAddOns.filter( ( addOn ) =>
			isStorageQuantityAvailable( addOn?.quantity ?? 0, siteMediaStorageData )
		);
	}, [ siteMediaStorage, storageAddOns ] );
};

export default useAvailableStorageAddOns;
