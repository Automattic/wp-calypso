import { getPlanClass } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { GridPlan, PlansIntent } from '../../types';

const SPOTLIGHT_ENABLED_INTENTS = [ 'plans-default-wpcom' ];

interface Params {
	gridPlans: GridPlan[] | null;
	intent?: PlansIntent;
	isSpotlightOnCurrentPlan?: boolean;
	siteId?: number | null;
}

const useGridPlanForSpotlight = ( {
	gridPlans,
	intent,
	isSpotlightOnCurrentPlan,
	siteId,
}: Params ): GridPlan | undefined => {
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const sitePlanSlug = currentPlan?.planSlug;

	return useMemo( () => {
		const isIntentSpotlightEnabled = intent ? SPOTLIGHT_ENABLED_INTENTS.includes( intent ) : false;

		return gridPlans && sitePlanSlug && isSpotlightOnCurrentPlan && isIntentSpotlightEnabled
			? gridPlans.find(
					( { planSlug } ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
			  )
			: undefined;
	}, [ sitePlanSlug, isSpotlightOnCurrentPlan, intent, gridPlans ] );
};

export default useGridPlanForSpotlight;
