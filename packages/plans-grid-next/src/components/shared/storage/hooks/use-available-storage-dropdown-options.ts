import {
	PlanSlug,
	WPComStorageAddOnSlug,
	WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { usePlansGridContext } from '../../../../grid-context';

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
}: Props ): ( WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug )[] | null => {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { planSlug, siteId } );

	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];

	return useMemo( () => {
		return storageFeature || availableStorageAddOns
			? [
					...( storageFeature ? [ storageFeature?.getSlug() as WPComPlanStorageFeatureSlug ] : [] ),
					...( availableStorageAddOns
						? availableStorageAddOns.map(
								( addOn ) => addOn?.featureSlugs?.[ 0 ] as WPComStorageAddOnSlug
						  )
						: [] ),
			  ]
			: null;
	}, [ storageFeature, availableStorageAddOns ] );
};

export default useAvailableStorageDropdownOptions;
