import { createContext, useContext } from '@wordpress/element';
import type { UseActionCallback, GridContextProps, GridPlan, PlansIntent } from './types';
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
		useActionCallback: UseActionCallback;
		recordTracksEvent?: GridContextProps[ 'recordTracksEvent' ];
	};
	coupon?: string;
	hideUnsupportedFeatures?: boolean;
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
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	useActionCallback,
	recordTracksEvent,
	allFeaturesList,
	siteId,
	children,
	coupon,
	hideUnsupportedFeatures,
	enableFeatureTooltips,
	enableCategorisedFeatures,
	featureGroupMap,
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
				helpers: { useCheckPlanAvailabilityForPurchase, useActionCallback, recordTracksEvent },
				coupon,
				hideUnsupportedFeatures,
				enableFeatureTooltips,
				enableCategorisedFeatures,
				featureGroupMap,
			} }
		>
			{ children }
		</PlansGridContext.Provider>
	);
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
