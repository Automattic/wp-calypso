/**
 * Internal dependencies
 */
import type { PlanAction } from './actions';
import type { Feature, Plan } from './types';

const DEFAUlT_STATE: {
	selectedPlanSlug: string | undefined;
	supportedPlans: Record< string, Plan >;
	prices: Record< string, string >;
	features: Feature[];
} = {
	selectedPlanSlug: undefined,
	supportedPlans: {},
	prices: {},
	features: [],
};

const reducer = function ( state = DEFAUlT_STATE, action: PlanAction ) {
	switch ( action.type ) {
		case 'SET_PLAN':
			return {
				...state,
				selectedPlanSlug: action.slug,
			};
		case 'SET_PLANS':
			return {
				...state,
				supportedPlans: action.plans,
			};
		case 'SET_PRICES':
			return {
				...state,
				prices: action.prices,
			};
		case 'SET_FEATURES':
			return {
				...state,
				features: action.features,
			};
		case 'RESET_PLAN':
			return DEFAUlT_STATE;
		default:
			return state;
	}
};

export type State = ReturnType< typeof reducer >;

export default reducer;
