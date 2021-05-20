/**
 * External dependencies
 */
import type { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import { PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_UPDATE } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export interface IPurchaseFlowState {
	primaryDomain: string | undefined;
}

const defaultState: IPurchaseFlowState = {
	primaryDomain: undefined,
};

function purchaseFlow(
	state: IPurchaseFlowState = defaultState,
	action: AnyAction
): IPurchaseFlowState {
	switch ( action.type ) {
		case PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_UPDATE:
			return {
				...state,
				primaryDomain: action.domainName,
			};
		default:
			return state;
	}
}

export default combineReducers( {
	purchaseFlow,
} );
