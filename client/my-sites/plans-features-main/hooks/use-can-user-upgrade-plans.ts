import { useSelector } from 'react-redux';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * TODO: Update docs
 * Returns a dictionary of plan slugs and whether or not they are available for purchase.
 * Note that:
 * - If there is not current-plan or selected-site defined, then plan is marked as purchasable.
 * This would be the equivalent of an Onboarding/Signup context, where no other conditions currently apply.
 * - If a selected site exists, then we check if the plan is available for purchase on that site.
 */
const useCanUserUpgradePlans = () => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	return useSelector( ( state ) => {
		// TODO: Update this comment
		// 1. No selected site: plan is in a context-free state and we assume the user is
		if ( ! selectedSiteId ) {
			return false;
		}

		return isCurrentUserCurrentPlanOwner( state, selectedSiteId );
	} );
};

export default useCanUserUpgradePlans;
