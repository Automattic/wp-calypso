import { StorageOption } from '@automattic/calypso-products';
import { AddOns, Site } from '@automattic/data-stores';
import { useCallback } from '@wordpress/element';
import { usePlansGridContext } from '../../../grid-context';

interface CallbackProps {
	storageOptions: StorageOption[];
}

/**
 * Ensures that storage options are filtered based on:
 *   - the available space upgrade on the Site,
 *     so never render something that would exceed that limit (hence fail during checkout)
 *   - storage option being allowed for purchase only once (cannot repurchase same add-on on any site)
 */
const useGetAvailableStorageOptions = () => {
	const { siteId } = usePlansGridContext();
	const siteMediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const currentMaxStorage = siteMediaStorage.data?.maxStorageBytes
		? siteMediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
		: 0;
	const availableStorageUpgrade = AddOns.STORAGE_LIMIT - currentMaxStorage;
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );

	return useCallback(
		( { storageOptions }: CallbackProps ) => {
			return storageOptions.filter( ( storageOption ) => {
				const storageAddOn = storageAddOns.find(
					( addOn ) =>
						! addOn?.purchased &&
						addOn?.featureSlugs?.includes( storageOption?.slug ) &&
						! addOn.exceedsSiteStorageLimits
				);

				// the following may not be necessary if `exceedsSiteStorageLimits` suffices
				return storageAddOn
					? ( storageAddOn?.quantity ?? 0 ) <= availableStorageUpgrade
					: ! storageOption.isAddOn;
			} );
		},
		[ availableStorageUpgrade, storageAddOns ]
	);
};

export default useGetAvailableStorageOptions;
