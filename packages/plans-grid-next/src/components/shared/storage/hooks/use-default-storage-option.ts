import { type PlanSlug, type WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE } from '../constants';

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
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	if ( ! gridPlansIndex?.features ) {
		return;
	}
	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const purchasedAddOn = storageAddOns?.find( ( storageAddOn ) => storageAddOn?.purchased );

	return purchasedAddOn && ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
		? ( purchasedAddOn?.addOnSlug as AddOns.StorageAddOnSlug )
		: ( storageFeature?.getSlug() as WPComPlanStorageFeatureSlug );
}
