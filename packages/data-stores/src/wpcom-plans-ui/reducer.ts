import { combineReducers } from '@wordpress/data';
import type { WpcomPlansUIAction } from './actions';
import type { selectedStorageAddOnsForPlans } from './types';
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

const selectedStorageAddOnsForPlans: Reducer<
	selectedStorageAddOnsForPlans | undefined,
	WpcomPlansUIAction
> = ( state, action ) => {
	if ( action.type === 'WPCOM_PLANS_UI_SET_STORAGE_ADD_ON_FOR_PLAN' ) {
		return { ...state, [ action.plan ]: action.addOnSlug };
	}
	return state;
};

const reducer = combineReducers( {
	showDomainUpsellDialog,
	selectedStorageAddOnsForPlans,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
