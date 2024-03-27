import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import type { PlanSlug } from '@automattic/calypso-products';

type Props = {
	planSlug: PlanSlug;
	selectedSiteId?: number | null;
	storageAddOnsForPlan?: ( AddOns.AddOnMeta | null )[] | null;
};

/**
 * Returns the selected storage add-on for a given plan.
 */
export default function useSelectedStorageAddOn( {
	planSlug,
	selectedSiteId,
	storageAddOnsForPlan,
}: Props ) {
	const selectedStorageOptionForPlan = useSelect(
		( select ) =>
			select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, selectedSiteId ),
		[ planSlug ]
	);

	return storageAddOnsForPlan?.find( ( addOn ) => {
		return selectedStorageOptionForPlan && addOn
			? addOn.featureSlugs?.includes( selectedStorageOptionForPlan )
			: false;
	} );
}
