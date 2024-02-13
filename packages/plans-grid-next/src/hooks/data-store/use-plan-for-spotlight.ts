import { getPlanClass } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { GridPlan } from '../../types';

const SPOTLIGHT_ENABLED_INTENTS = [ 'plans-default-wpcom' ];

interface Params {
	plansForFeaturesGrid: GridPlan[];
	intent: string | undefined;
	isSpotlightOnCurrentPlan?: boolean;
	sitePlanSlug?: string | null;
}

const usePlanForSpotlight = ( {
	plansForFeaturesGrid,
	intent,
	isSpotlightOnCurrentPlan,
	sitePlanSlug,
}: Params ): GridPlan | undefined => {
	return useMemo( () => {
		const isIntentSpotlightEnabled = intent ? SPOTLIGHT_ENABLED_INTENTS.includes( intent ) : false;

		return sitePlanSlug && isSpotlightOnCurrentPlan && isIntentSpotlightEnabled
			? plansForFeaturesGrid.find(
					( { planSlug } ) => getPlanClass( planSlug ) === getPlanClass( sitePlanSlug )
			  )
			: undefined;
	}, [ sitePlanSlug, isSpotlightOnCurrentPlan, intent, plansForFeaturesGrid ] );
};

export default usePlanForSpotlight;
