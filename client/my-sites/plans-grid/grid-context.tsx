import { createContext, useContext } from '@wordpress/element';
import { GridContextProps } from './types';
import type {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { FeatureList } from '@automattic/calypso-products';

interface PlansGridContext {
	intent?: PlansIntent;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers?: Record< 'usePricingMetaForGridPlans', UsePricingMetaForGridPlans >;
	coupon?: string;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
	usePricingMetaForGridPlans,
	allFeaturesList,
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
				gridPlans,
				gridPlansIndex,
				allFeaturesList,
				helpers: { usePricingMetaForGridPlans },
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
