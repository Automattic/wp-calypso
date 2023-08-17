import { combineReducers } from '@wordpress/data';
import type { WpcomPlansUIAction } from './actions';
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

const reducer = combineReducers( {
	showDomainUpsellDialog,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
