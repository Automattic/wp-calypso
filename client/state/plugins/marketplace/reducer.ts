/**
 * External dependencies
 */
import type { AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import {
	PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE,
	PLUGINS_MARKETPLACE_SET_PLUGIN_TO_BE_INSTALLED,
	PLUGINS_MARKETPLACE_SET_IS_PLUGIN_INSTALLED_DURING_PURCHASE,
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
		case PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE:
			action = action as ISetPrimaryDomainCandidateAction;
			return {
				...state,
				primaryDomain: action.domainName,
			};
		case PLUGINS_MARKETPLACE_SET_PLUGIN_TO_BE_INSTALLED:
			action = action as ISetPluginToBeInstalledAction;
			return {
				...state,
				pluginSlugToBeInstalled: action.pluginSlugToBeInstalled,
			};
		case PLUGINS_MARKETPLACE_SET_IS_PLUGIN_INSTALLED_DURING_PURCHASE:
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
