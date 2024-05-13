import { createContext, useContext } from '@wordpress/element';
import type { GridContextProps, GridPlan, PlansIntent, UseAction } from './types';
import type { FeatureList, FeatureGroupMap } from '@automattic/calypso-products';
import type { Plans } from '@automattic/data-stores';

interface PlansGridContext {
	intent?: PlansIntent;
	siteId?: number | null;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers: {
		useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
		// TODO: Fix this type
		useAction: UseAction;
		recordTracksEvent?: GridContextProps[ 'recordTracksEvent' ];
	};
	coupon?: string;
	enableFeatureTooltips?: boolean;
	/**
	 * `enableCategorisedFeatures` relevant to Features Grid (and omitted from Comparison Grid)
	 * for rendering features with categories based on available/associated feature group map.
	 */
	enableCategorisedFeatures?: boolean;
	/**
	 * `featureGroupMap` is relevant for rendering features with categories.
	 * This is necessary for Comparison Grid and optional for Features Grid (i.e. applicable when `enableCategorisedFeatures` is set).
	 */
	featureGroupMap: Partial< FeatureGroupMap >;
	hideUnsupportedFeatures?: boolean;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	useAction,
	recordTracksEvent,
	allFeaturesList,
	siteId,
	children,
	coupon,
	enableFeatureTooltips,
	enableCategorisedFeatures,
	featureGroupMap,
	hideUnsupportedFeatures,
}: GridContextProps ) => {
	const gridPlansIndex = gridPlans.reduce(
		( acc, gridPlan ) => ( {
			...acc,
			[ gridPlan.planSlug ]: gridPlan,
		} ),
		{}
	);

	return (
		<PlansGridContext.Provider
			value={ {
				intent,
				siteId,
				gridPlans,
				gridPlansIndex,
				allFeaturesList,
				helpers: {
					useCheckPlanAvailabilityForPurchase,
					useAction,
					recordTracksEvent,
				},
				coupon,
				enableFeatureTooltips,
				enableCategorisedFeatures,
				featureGroupMap,
				hideUnsupportedFeatures,
			} }
		>
			{ children }
		</PlansGridContext.Provider>
	);
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
