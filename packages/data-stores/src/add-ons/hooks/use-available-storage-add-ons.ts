import { useMemo } from '@wordpress/element';
import { useSiteMediaStorage } from '../../site';
import { STORAGE_LIMIT } from '../constants';
import useStorageAddOns from './use-storage-add-ons';

interface Props {
	siteId?: number | null;
}

/**
 * Returns the storage add-ons that are available for purchase considering the current site when present.
 * Conditions:
 * - If the user has not purchased the storage add-on.
 * - If the storage add-on does not exceed the site storage limits.
 * - If the quantity of the storage add-on is less than or equal to the available storage upgrade.
 */
const useAvailableStorageAddOns = ( { siteId }: Props ) => {
	const storageAddOns = useStorageAddOns( { siteId } );
	const siteMediaStorage = useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const currentMaxStorage = siteMediaStorage.data?.maxStorageBytes
		? siteMediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
		: 0;
	const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;

	return useMemo( () => {
		const availableStorageAddOns = storageAddOns.filter( ( addOn ) =>
			addOn
				? ! addOn.purchased &&
				  ! addOn.exceedsSiteStorageLimits &&
				  ( addOn.quantity ?? 0 ) <= availableStorageUpgrade
				: false
		);

		return availableStorageAddOns?.length ? availableStorageAddOns : null;
	}, [ availableStorageUpgrade, storageAddOns ] );
};

export default useAvailableStorageAddOns;
