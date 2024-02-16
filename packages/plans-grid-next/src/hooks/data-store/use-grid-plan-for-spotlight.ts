import { getPlanClass } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { GridPlan, PlansIntent } from '../../types';

const SPOTLIGHT_ENABLED_INTENTS = [ 'plans-default-wpcom' ];

interface Params {
	gridPlansForFeaturesGrid: GridPlan[];
	intent?: PlansIntent;
	isSpotlightOnCurrentPlan?: boolean;
	sitePlanSlug?: string | null;
}

const useGridPlanForSpotlight = ( {
	gridPlansForFeaturesGrid,
	intent,
	isSpotlightOnCurrentPlan,
	sitePlanSlug,
}: Params ): GridPlan | undefined => {
	return useMemo( () => {
		const isIntentSpotlightEnabled = intent ? SPOTLIGHT_ENABLED_INTENTS.includes( intent ) : false;

		return sitePlanSlug && isSpotlightOnCurrentPlan && isIntentSpotlightEnabled
			? gridPlansForFeaturesGrid.find(
					( { planSlug } ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
			  )
			: undefined;
	}, [ sitePlanSlug, isSpotlightOnCurrentPlan, intent, gridPlansForFeaturesGrid ] );
};

export default useGridPlanForSpotlight;
