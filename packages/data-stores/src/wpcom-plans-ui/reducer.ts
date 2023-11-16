import { combineReducers } from '@wordpress/data';
import type { WpcomPlansUIAction } from './actions';
import type { SelectedStorageOptionForPlans } from './types';
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

const selectedStorageOptionForPlans: Reducer<
	SelectedStorageOptionForPlans | undefined,
	WpcomPlansUIAction
> = ( state, action ) => {
	if ( action.type === 'WPCOM_PLANS_UI_SET_SELECTED_STORAGE_OPTION_FOR_PLAN' ) {
		return { ...state, [ action.planSlug ]: action.addOnSlug };
	}
	return state;
};

const reducer = combineReducers( {
	showDomainUpsellDialog,
	selectedStorageOptionForPlans,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
