/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';
import { IAppState } from '../reducer';
import { IPurchaseFlowState, MARKETPLACE_ASYNC_PROCESS_STATUS } from './types';
import { isFetching as getIsWporgPluginFetching } from 'calypso/state/plugins/wporg/selectors';
import { isLoaded, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';

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

export function getIsPluginInformationLoaded(
	state: IAppState,
	selectedSiteId: number,
	pluginSlugToBeInstalled: string
): boolean {
	const isPluginStateLoaded = isLoaded( state, [ selectedSiteId ] );
	const isPluginStateFetching = isRequestingForSites( state, [ selectedSiteId ] );
	const isWporgPluginFetching = getIsWporgPluginFetching( state, pluginSlugToBeInstalled );

	const isPluginInformationLoaded =
		isPluginStateLoaded && ! isPluginStateFetching && ! isWporgPluginFetching;

	return isPluginInformationLoaded;
}
