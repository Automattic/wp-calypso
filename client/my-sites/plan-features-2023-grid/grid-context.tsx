import { PlanSlug } from '@automattic/calypso-products';
import { createContext, useContext } from '@wordpress/element';
import type {
	GridPlan,
	PlansIntent,
} from './hooks/npm-ready/data-store/use-wpcom-plans-with-intent';

interface PlansGridContext {
	intent?: PlansIntent;
	planRecords: Record< PlanSlug, GridPlan >;
	visiblePlans: PlanSlug[];
	mobileOpenTooltipText: string;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider: React.FunctionComponent<
	PlansGridContext & { children: React.ReactNode }
> = ( { intent, planRecords, visiblePlans, mobileOpenTooltipText, children } ) => {
	return (
		<PlansGridContext.Provider
			value={ { intent, planRecords, visiblePlans, mobileOpenTooltipText } }
		>
			{ children }
		</PlansGridContext.Provider>
	);
};

export const usePlansGridContext = (): PlansGridContext => useContext( PlansGridContext );

export type { PlansIntent };

export default PlansGridContextProvider;
