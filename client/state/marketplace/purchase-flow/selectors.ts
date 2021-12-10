import 'calypso/state/marketplace/init';
import {
	IPurchaseFlowState,
	MARKETPLACE_ASYNC_PROCESS_STATUS,
} from 'calypso/state/marketplace/types';
import { isLoaded, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import { isFetching as getIsWporgPluginFetching } from 'calypso/state/plugins/wporg/selectors';
import { IAppState } from 'calypso/state/types';

export function getPrimaryDomainCandidate( state: IAppState ): string | null {
	return state.marketplace.purchaseFlow.primaryDomain;
}

export function getPurchaseFlowState( state: IAppState ): IPurchaseFlowState {
	return state.marketplace.purchaseFlow;
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
	pluginSlug: string
): boolean {
	const isPluginStateLoaded = isLoaded( state, [ selectedSiteId ] );
	const isPluginStateFetching = isRequestingForSites( state, [ selectedSiteId ] );
	const isWporgPluginFetching = getIsWporgPluginFetching( state, pluginSlug );

	const isPluginInformationLoaded =
		isPluginStateLoaded && ! isPluginStateFetching && ! isWporgPluginFetching;

	return isPluginInformationLoaded;
}
