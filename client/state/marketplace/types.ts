import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';

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
	productSlugInstalled: string | null;
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS;
}

export interface IBillingIntervalState {
	interval: IntervalLength.MONTHLY | IntervalLength.ANNUALLY;
}

export enum IReinstallProductsStatus {
	COMPLETED = 'completed',
	FAILED = 'failed',
	IN_PROGRESS = 'in-progress',
	NOT_STARTED = 'not-started',
}

export interface IReinstallProductsState {
	[ siteId: number ]: {
		status: IReinstallProductsStatus;
		error?: string;
	};
}

export interface IMarketplaceState {
	purchaseFlow: IPurchaseFlowState;
	billingInterval: IBillingIntervalState;
	reinstallProducts: IReinstallProductsState;
}
