import {
	MARKETPLACE_PRIMARY_DOMAIN_SELECT,
	MARKETPLACE_SITE_TRANSFER_STATE_CHANGE,
	MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
	MARKETPLACE_SITE_TRANSFER_PLUGIN_INSTALL,
	MARKETPLACE_QUEUE_PRODUCT_INSTALL,
} from 'calypso/state/action-types';
import { THEME_TRANSFER_INITIATE_REQUEST } from 'calypso/state/themes/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { MARKETPLACE_ASYNC_PROCESS_STATUS, IPurchaseFlowState } from '../types';
import { purchaseFlowSchema } from './schema';
import type { AnyAction } from 'redux';

export const defaultState: IPurchaseFlowState = {
	primaryDomain: null,
	productSlugInstalled: null,
	productGroupSlug: null,
	siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
	reasonForSiteTransferStatus: null,
	reasonForPluginInstallationStatus: null,
	isPluginInstalledAlongWithTransfer: null,
};

const purchaseFlow = withSchemaValidation(
	purchaseFlowSchema,
	( state: IPurchaseFlowState = defaultState, action: AnyAction ): IPurchaseFlowState => {
		switch ( action.type ) {
			case MARKETPLACE_PRIMARY_DOMAIN_SELECT:
				return {
					...state,
					primaryDomain: action.domainName,
				};
			case MARKETPLACE_QUEUE_PRODUCT_INSTALL:
				return {
					...state,
					siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
					pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
					productSlugInstalled: action.productSlug,
					productGroupSlug: action.productGroupSlug,
					primaryDomain: action.primaryDomain,
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
);

export default purchaseFlow;
