import { createContext, useContext } from '@wordpress/element';
import type {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { GridContextProps, UseCheckPlanAvailabilityForPurchase } from './types';
import type { FeatureList } from '@automattic/calypso-products';

interface PlansGridContext {
	intent?: PlansIntent;
	selectedSiteId?: number | null;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers?: {
		usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
		useCheckPlanAvailabilityForPurchase: UseCheckPlanAvailabilityForPurchase;
	};
	coupon?: string;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
	usePricingMetaForGridPlans,
	useCheckPlanAvailabilityForPurchase,
	allFeaturesList,
	selectedSiteId,
	children,
	coupon,
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
				selectedSiteId,
				gridPlans,
				gridPlansIndex,
				allFeaturesList,
				helpers: { usePricingMetaForGridPlans, useCheckPlanAvailabilityForPurchase },
				coupon,
			} }
		>
			{ children }
		</PlansGridContext.Provider>
	);
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
