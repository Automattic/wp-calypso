import { useMemo } from '@wordpress/element';
import { useSiteMediaStorage } from '../../site';
import { STORAGE_LIMIT } from '../constants';
import { AddOnMeta } from '../types';
import useStorageAddOns from './use-storage-add-ons';

interface Props {
	siteId?: number | null;
}

export function isStorageQuantityAvailable( quantity: number, maxStorageBytes?: number ) {
	const currentMaxStorage =
		maxStorageBytes !== undefined ? maxStorageBytes / Math.pow( 1024, 3 ) : 0;
	const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;

	return quantity <= availableStorageUpgrade;
}

/**
 * Returns the storage add-ons that are available for purchase considering the current site when present.
 * Conditions:
 * - If the user has not purchased the storage add-on.
 * - If the storage add-on does not exceed the site storage limits.
 * - If the quantity of the storage add-on is less than or equal to the available storage upgrade.
 */
const useAvailableStorageAddOns = ( { siteId }: Props ): AddOnMeta[] => {
	const storageAddOns = useStorageAddOns( { siteId } );
	const siteMediaStorage = useSiteMediaStorage( { siteIdOrSlug: siteId } );

	return useMemo( () => {
		return storageAddOns
			.filter( ( addOn ) => addOn !== null )
			.filter( ( addOn ): addOn is AddOnMeta =>
				isStorageQuantityAvailable( addOn?.quantity ?? 0, siteMediaStorage.data?.maxStorageBytes )
			);
	}, [ siteMediaStorage, storageAddOns ] );
};

export default useAvailableStorageAddOns;
