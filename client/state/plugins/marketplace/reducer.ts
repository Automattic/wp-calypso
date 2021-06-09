/**
 * External dependencies
 */
import type { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	MARKETPLACE_PRIMARY_DOMAIN_SELECT,
	MARKETPLACE_QUEUE_PLUGIN_INSTALL,
	MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import {
	IPurchaseFlowState,
	ISetPluginInstalledDuringPurchaseFlag,
	ISetPluginToBeInstalledAction,
	ISetPrimaryDomainCandidateAction,
} from './types';

export const defaultState: IPurchaseFlowState = {
	primaryDomain: undefined,
	pluginSlugToBeInstalled: undefined,
	isPluginInstalledDuringPurchase: false,
};

export function purchaseFlow(
	state: IPurchaseFlowState = defaultState,
	action: AnyAction
): IPurchaseFlowState {
	switch ( action.type ) {
		case MARKETPLACE_PRIMARY_DOMAIN_SELECT:
			action = action as ISetPrimaryDomainCandidateAction;
			return {
				...state,
				primaryDomain: action.domainName,
			};
		case MARKETPLACE_QUEUE_PLUGIN_INSTALL:
			action = action as ISetPluginToBeInstalledAction;
			return {
				...state,
				pluginSlugToBeInstalled: action.pluginSlugToBeInstalled,
			};
		case MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE:
			action = action as ISetPluginInstalledDuringPurchaseFlag;
			return {
				...state,
				isPluginInstalledDuringPurchase: action.isPluginInstalledDuringPurchase,
			};
		default:
			return state;
	}
}

export default combineReducers( {
	purchaseFlow,
} );
