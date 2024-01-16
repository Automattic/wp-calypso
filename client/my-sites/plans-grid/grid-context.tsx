import { createContext, useContext } from '@wordpress/element';
import type { GridPlan, PlansIntent } from './hooks/npm-ready/data-store/use-grid-plans';
import type { GridContextProps } from './types';
import type { FeatureList } from '@automattic/calypso-products';
import type { Plans } from '@automattic/data-stores';

interface PlansGridContext {
	intent?: PlansIntent;
	selectedSiteId?: number | null;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers: {
		useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	};
	coupon?: string;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
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
				helpers: { useCheckPlanAvailabilityForPurchase },
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
