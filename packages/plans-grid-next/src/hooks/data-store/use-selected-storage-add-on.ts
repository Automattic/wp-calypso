import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { usePlansGridContext } from '../../grid-context';
import type { PlanSlug } from '@automattic/calypso-products';

type Props = {
	planSlug: PlanSlug;
};

/**
 * Returns the selected storage add-on for a given plan.
 */
export default function useSelectedStorageAddOn( { planSlug }: Props ) {
	const { siteId } = usePlansGridContext();
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug, siteId ]
	);

	return storageAddOns?.find( ( addOn ) => {
		return selectedStorageOptionForPlan && addOn
			? addOn.featureSlugs?.includes( selectedStorageOptionForPlan )
			: false;
	} );
}
