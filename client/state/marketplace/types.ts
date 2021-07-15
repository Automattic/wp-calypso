/**
 * External dependencies
 */
import { IProductCollection, IProductGroupCollection } from 'calypso/my-sites/marketplace/types';

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
	// TODO : remove reliance on plugin slug to be installed
	pluginSlugToBeInstalled: string | null;
	productSlugInstalled: keyof IProductCollection | null;
	productGroupSlug: keyof IProductGroupCollection | null;
	isPluginInstalledDuringPurchase: boolean;
	siteTransferStatus: MARKETPLACE_ASYNC_PROCESS_STATUS;
	reasonForSiteTransferStatus: string | null;
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS;
	reasonForPluginInstallationStatus: string | null;
	isPluginInstalledAlongWithTransfer: boolean | null;
}
export interface IMarketplaceState {
	purchaseFlow: IPurchaseFlowState;
}
