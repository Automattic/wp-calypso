/**
 * External dependencies
 */
import type { Action } from 'redux';

export enum MARKETPLACE_ASYNC_PROCESS_STATUS {
	/**
	 * An async process's state will remain unknown until we fetch the state from the backend
	 */
	UNKNOWN = 'UNKNOWN',
	FETCHING = 'FETCHING',
	NOT_STARTED = 'NOT_STARTED',
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	ERROR = 'ERROR',
}
export interface IPurchaseFlowState {
	primaryDomain: string | null;
	pluginSlugToBeInstalled: string | null;
	isPluginInstalledDuringPurchase: boolean;
	siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS;
	reasonForSiteTransferStatus: string | null;
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS;
	reasonForPluginInstallationStatus: string | null;
	isPluginInstalledAlongWithTransfer: boolean | null;
}

export interface ISetPrimaryDomainCandidateAction extends Action {
	domainName: string | undefined;
}

export interface ISetPluginToBeInstalledAction extends Action {
	pluginSlugToBeInstalled: string | undefined;
}

export interface ISetPluginInstalledDuringPurchaseFlag extends Action {
	isPluginInstalledDuringPurchase: boolean;
}

export interface IMarketplaceState {
	purchaseFlow: IPurchaseFlowState;
}
