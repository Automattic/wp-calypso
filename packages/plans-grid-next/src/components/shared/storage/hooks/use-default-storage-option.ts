import { type PlanSlug, type WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';
import usePurchasedStorageAddOn from './use-purchased-storage-add-on';

type Props = {
	planSlug: PlanSlug;
};

/**
 * Returns the storage add-on upsell option to display to
 * the user on initial load. If the user has purchased a
 * storage add-on, that will be the default. Otherwise,
 * the storage included with any given plan will be used.
 */
export default function useDefaultStorageOption( {
	planSlug,
}: Props ): AddOns.StorageAddOnSlug | WPComPlanStorageFeatureSlug | undefined {
	const { gridPlansIndex } = usePlansGridContext();
	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const purchasedStorageAddOn = usePurchasedStorageAddOn();
	const planStorageFeatureSlug = storageFeature?.getSlug() as WPComPlanStorageFeatureSlug;

	if ( ! purchasedStorageAddOn ) {
		return planStorageFeatureSlug;
	}

	return ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
		? ( purchasedStorageAddOn.addOnSlug as AddOns.StorageAddOnSlug )
		: planStorageFeatureSlug;
}
