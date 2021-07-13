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
	MARKETPLACE_SITE_TRANSFER_STATE_CHANGE,
	MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
	MARKETPLACE_SITE_TRANSFER_PLUGIN_INSTALL,
} from 'calypso/state/action-types';
import {
	MARKETPLACE_ASYNC_PROCESS_STATUS,
	IPurchaseFlowState,
	ISetPluginInstalledDuringPurchaseFlag,
	ISetPluginToBeInstalledAction,
	ISetPrimaryDomainCandidateAction,
} from '../types';
import { THEME_TRANSFER_INITIATE_REQUEST } from 'calypso/state/themes/action-types';

export const defaultState: IPurchaseFlowState = {
	primaryDomain: null,
	pluginSlugToBeInstalled: null,
	isPluginInstalledDuringPurchase: false,
	siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
	reasonForSiteTransferStatus: null,
	reasonForPluginInstallationStatus: null,
	isPluginInstalledAlongWithTransfer: null,
};

export default function purchaseFlow(
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
				siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
				pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
				pluginSlugToBeInstalled: action.pluginSlugToBeInstalled,
			};
		case MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE:
			action = action as ISetPluginInstalledDuringPurchaseFlag;
			return {
				...state,
				siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
				pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
				isPluginInstalledDuringPurchase: action.isPluginInstalledDuringPurchase,
			};
		case THEME_TRANSFER_INITIATE_REQUEST:
			return {
				...state,
				siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
				pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
			};
		case MARKETPLACE_SITE_TRANSFER_STATE_CHANGE: {
			const { isPluginInstalledAlongWithTransfer } = state;
			if (
				isPluginInstalledAlongWithTransfer &&
				action.state === MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED
			) {
				/**
				 * If the site transfer happened together with a plugin installation
				 * We mark the plugin installation as completed as well
				 */
				return {
					...state,
					siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
					reasonForSiteTransferStatus: 'Site transfer and plugin install done together',
					pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
					reasonForPluginInstallationStatus: 'Site transfer and plugin install done together',
				};
			}
			return {
				...state,
				siteTransferStatus: action.state,
				reasonForSiteTransferStatus: action.reason,
			};
		}
		case MARKETPLACE_SITE_TRANSFER_PLUGIN_INSTALL:
			return {
				...state,
				siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
				pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS,
				isPluginInstalledAlongWithTransfer: true,
			};
		case MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE:
			return {
				...state,
				pluginInstallationStatus: action.state,
				reasonForPluginInstallationStatus: action.reason,
			};
		default:
			return state;
	}
}
