import { PlanSlug, WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { usePlansGridContext } from '../../../../grid-context';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';

interface Props {
	planSlug: PlanSlug;
}

/**
 * Ensures that storage dropdown options are filtered based on:
 *   - the available space upgrade on the Site,
 *     so never render something that would exceed that limit (hence fail during checkout)
 *   - storage option being allowed for purchase only once (cannot repurchase same add-on on any site)
 */
const useAvailableStorageDropdownOptions = ( {
	planSlug,
}: Props ): ( AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug )[] | null => {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId } );

	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];

	return useMemo( () => {
		return storageFeature || availableStorageAddOns.length
			? [
					...( storageFeature ? [ storageFeature?.getSlug() as WPComPlanStorageFeatureSlug ] : [] ),
					/**
					 * ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE check here is redundant, as the call is already for plans that are eligible.
					 * But being extra cautious here (in case the call is made elsewhere in the future, where it might not be redundant)
					 * TODO: Also planning to refactor this closer to the data layer e.g. plans having a "storage-upgradeable" flag.
					 */
					...( ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
						? availableStorageAddOns.map( ( addOn ) => addOn?.addOnSlug as AddOns.StorageAddOnSlug )
						: [] ),
			  ]
			: null;
	}, [ storageFeature, availableStorageAddOns, planSlug ] );
};

export default useAvailableStorageDropdownOptions;
