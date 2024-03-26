import { createContext, useContext } from '@wordpress/element';
import type { GetActionCallbackParams, GridContextProps, GridPlan, PlansIntent } from './types';
import type { FeatureList } from '@automattic/calypso-products';
import type { Plans } from '@automattic/data-stores';

interface PlansGridContext {
	intent?: PlansIntent;
	siteId?: number | null;
	gridPlans: GridPlan[];
	gridPlansIndex: { [ key: string ]: GridPlan };
	allFeaturesList: FeatureList;
	helpers: {
		useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
		getActionCallback: ( options: GetActionCallbackParams ) => () => void;
		recordTracksEvent?: GridContextProps[ 'recordTracksEvent' ];
	};
	coupon?: string;
}

const PlansGridContext = createContext< PlansGridContext >( {} as PlansGridContext );

const PlansGridContextProvider = ( {
	intent,
	gridPlans,
	useCheckPlanAvailabilityForPurchase,
	getActionCallback,
	recordTracksEvent,
	allFeaturesList,
	siteId,
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
				siteId,
				gridPlans,
				gridPlansIndex,
				allFeaturesList,
				helpers: { useCheckPlanAvailabilityForPurchase, getActionCallback, recordTracksEvent },
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
