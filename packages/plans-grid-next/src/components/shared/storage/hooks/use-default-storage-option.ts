import {
	type PlanSlug,
	type WPComStorageAddOnSlug,
	type WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';

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
}: Props ): WPComStorageAddOnSlug | WPComPlanStorageFeatureSlug | undefined {
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const {
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const purchasedAddOn = storageAddOns?.find( ( storageAddOn ) => storageAddOn?.purchased );

	return purchasedAddOn && AddOns.ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
		? ( purchasedAddOn?.featureSlugs?.[ 0 ] as WPComStorageAddOnSlug )
		: ( storageFeature?.getSlug() as WPComPlanStorageFeatureSlug );
}
