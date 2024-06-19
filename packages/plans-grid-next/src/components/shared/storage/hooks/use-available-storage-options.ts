import {
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	PlanSlug,
	WPComStorageAddOnSlug,
	WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { AddOns, Site } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { usePlansGridContext } from '../../../../grid-context';

interface Props {
	planSlug: PlanSlug;
}

const ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

/**
 * Ensures that storage options are filtered based on:
 *   - the available space upgrade on the Site,
 *     so never render something that would exceed that limit (hence fail during checkout)
 *   - storage option being allowed for purchase only once (cannot repurchase same add-on on any site)
 */
const useAvailableStorageOptions = ( {
	planSlug,
}: Props ): ( WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug )[] | null => {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const siteMediaStorage = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const currentMaxStorage = siteMediaStorage.data?.maxStorageBytes
		? siteMediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
		: 0;
	const availableStorageUpgrade = AddOns.STORAGE_LIMIT - currentMaxStorage;
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );

	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];

	return useMemo( () => {
		const availableStorageAddOns = ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
			? storageAddOns.filter( ( addOn ) =>
					addOn
						? ! addOn?.purchased &&
						  ! addOn?.exceedsSiteStorageLimits &&
						  ( addOn?.quantity ?? 0 ) <= availableStorageUpgrade
						: false
			  )
			: null;

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
	}, [ planSlug, storageAddOns, storageFeature, availableStorageUpgrade ] );
};

export default useAvailableStorageOptions;
