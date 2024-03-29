import { useMemo } from '@wordpress/element';
import useSitePlans from '../queries/use-site-plans';
import { SitePlan } from '../types';

interface Props {
	siteId?: string | number | null;
}

// TODO: Use this hook to retrieve current plan in plans grid
const useCurrentPlan = ( { siteId }: Props ): SitePlan | undefined => {
	const sitePlans = useSitePlans( { siteId } );

	return useMemo(
		() =>
			sitePlans?.data
				? Object.values( sitePlans?.data ).find( ( plan ) => plan.currentPlan )
				: undefined,
		[ sitePlans.data ]
	);
};

export default useCurrentPlan;
