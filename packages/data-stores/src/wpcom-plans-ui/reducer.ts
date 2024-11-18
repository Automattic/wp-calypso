import { combineReducers } from '@wordpress/data';
import type { WpcomPlansUIAction } from './actions';
import type { SelectedStorageOptionForPlan } from './types';
import type { Reducer } from 'redux';

const showDomainUpsellDialog: Reducer< boolean | undefined, WpcomPlansUIAction > = (
	state,
	action
) => {
	if ( action.type === 'WPCOM_PLANS_UI_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'WPCOM_PLANS_UI_DOMAIN_UPSELL_DIALOG_SET_SHOW' ) {
		return action.show;
	}
	return state;
};

const isAnyVisibileGridPlanDiscounted: Reducer< boolean | undefined, WpcomPlansUIAction > = (
	state,
	action
) => {
	if ( action.type === 'WPCOM_PLANS_UI_RESET_STORE' ) {
		return undefined;
	} else if ( action.type === 'WPCOM_PLANS_UI_SET_IS_ANY_VISIBLE_GRID_PLAN_DISCOUNTED' ) {
		return action.isAnyVisibleGridPlanDiscounted;
	}
	return state;
};

const selectedStorageOptionForPlan: Reducer<
	SelectedStorageOptionForPlan | undefined,
	WpcomPlansUIAction
> = ( state, action ) => {
	if ( action.type === 'WPCOM_PLANS_UI_SET_SELECTED_STORAGE_OPTION_FOR_PLAN' ) {
		return {
			...state,
			// @ts-expect-error TS is unhappy if we index an object by a null or an undefined value. We, however,
			// expect siteId to be null or undefined here before site creation ( Ex. during onboarding ).
			[ action.siteId ]: { ...state?.[ action.siteId ], [ action.planSlug ]: action.addOnSlug },
		};
	}
	return state;
};

const reducer = combineReducers( {
	showDomainUpsellDialog,
	selectedStorageOptionForPlan,
	isAnyVisibileGridPlanDiscounted,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
