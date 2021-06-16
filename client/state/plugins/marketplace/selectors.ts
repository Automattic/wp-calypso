/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';
import { IAppState } from '../reducer';
import { IPurchaseFlowState, MARKETPLACE_ASYNC_PROCESS_STATUS } from './types';

export function getPrimaryDomainCandidate( state: IAppState ): string | null {
	return state.plugins.marketplace.purchaseFlow.primaryDomain;
}

export function getPurchaseFlowState( state: IAppState ): IPurchaseFlowState {
	return state.plugins.marketplace.purchaseFlow;
}

export function getIsProductSetupComplete( state: IAppState ): boolean {
	const { siteTransferStatus, pluginInstallationStatus } = getPurchaseFlowState( state );

	return (
		siteTransferStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
		pluginInstallationStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED
	);
}

export function getHasProductSetupError( state: IAppState ): boolean {
	const { siteTransferStatus, pluginInstallationStatus } = getPurchaseFlowState( state );

	return (
		siteTransferStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR ||
		pluginInstallationStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR
	);
}
