import {
	FeatureList,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import { GridPlan, PlansIntent } from '../../types';
import useRestructuredPlanFeaturesForComparisonGrid from './use-restructured-plan-features-for-comparison-grid';

interface Params {
	allFeaturesList: FeatureList;
	gridPlans: Omit< GridPlan, 'features' >[];
	intent?: PlansIntent;
	selectedFeature?: string | null;
	showLegacyStorageFeature?: boolean;
}

const useGridPlansForComparisonGrid = ( {
	allFeaturesList,
	gridPlans,
	intent,
	selectedFeature,
	showLegacyStorageFeature,
}: Params ): GridPlan[] => {
	const planFeaturesForComparisonGrid = useRestructuredPlanFeaturesForComparisonGrid( {
		allFeaturesList,
		gridPlans,
		intent,
		selectedFeature,
		showLegacyStorageFeature,
	} );

	return useMemo( () => {
		const hiddenPlans = [ PLAN_HOSTING_TRIAL_MONTHLY, PLAN_ENTERPRISE_GRID_WPCOM ];

		return gridPlans.reduce( ( acc, gridPlan ) => {
			if ( gridPlan.isVisible && ! hiddenPlans.includes( gridPlan.planSlug ) ) {
				return [
					...acc,
					{
						...gridPlan,
						features: planFeaturesForComparisonGrid[ gridPlan.planSlug ],
					},
				];
			}

			return acc;
		}, [] as GridPlan[] );
	}, [ gridPlans, planFeaturesForComparisonGrid ] );
};

export default useGridPlansForComparisonGrid;
