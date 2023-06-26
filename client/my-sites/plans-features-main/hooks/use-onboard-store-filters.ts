import { PlanSlug, isFreePlan } from '@automattic/calypso-products';
import { OnboardSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';

const useOnboardStoreFilters = ( plans: PlanSlug[] ): PlanSlug[] => {
	const hideFreePlan = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getHideFreePlan(),
		[]
	);

	return plans.filter( ( planSlug ) => {
		if ( isFreePlan( planSlug ) ) {
			return ! hideFreePlan;
		}
		return true;
	} );
};

export default useOnboardStoreFilters;
