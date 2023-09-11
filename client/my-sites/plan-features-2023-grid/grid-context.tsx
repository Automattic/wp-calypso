import { createContext, useContext } from '@wordpress/element';
import type {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { FeatureList } from '@automattic/calypso-products';

interface PlansGridContext {
	siteId?: string | number | null;
	intent?: PlansIntent;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers?: Record< 'usePricingMetaForGridPlans', UsePricingMetaForGridPlans >;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

interface PlansGridContextProviderProps {
	siteId?: string | number | null;
	intent?: PlansIntent;
	gridPlans: GridPlan[];
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	allFeaturesList: FeatureList;
	children: React.ReactNode;
}

const PlansGridContextProvider = ( {
	siteId,
	intent,
	gridPlans,
	usePricingMetaForGridPlans,
	allFeaturesList,
	children,
}: PlansGridContextProviderProps ) => {
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
				siteId,
				intent,
				gridPlans,
				gridPlansIndex,
				allFeaturesList,
				helpers: { usePricingMetaForGridPlans },
			} }
		>
			{ children }
		</PlansGridContext.Provider>
	);
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
