import { AddOns } from '@automattic/data-stores';
import { usePlansGridContext } from '../../../../grid-context';
import type {
	PlanSlug,
	WPComStorageAddOnSlug,
	WPComPlanStorageFeatureSlug,
} from '@automattic/calypso-products';

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
		features: { storageOptions },
	} = gridPlansIndex[ planSlug ];
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const purchasedStorageAddOn = storageAddOns?.find( ( storageAddOn ) => storageAddOn?.purchased );
	const matchingAddOn = storageOptions?.find( ( storageOption ) =>
		purchasedStorageAddOn?.featureSlugs?.length
			? storageOption.slug === purchasedStorageAddOn.featureSlugs[ 0 ]
			: false
	);

	return (
		matchingAddOn?.slug ||
		storageOptions?.find( ( storageOption ) => ! storageOption.isAddOn )?.slug
	);
}
