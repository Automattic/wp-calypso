/**
 * External dependencies
 */
import type { AnyAction, Dispatch } from 'redux';

/**
 * Internal dependencies
 */
import 'calypso/state/marketplace/init';
import {
	MARKETPLACE_PRIMARY_DOMAIN_SELECT,
	MARKETPLACE_QUEUE_PLUGIN_INSTALL,
	MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE,
	MARKETPLACE_RESET_PURCHASE_FLOW,
	MARKETPLACE_SITE_TRANSFER_STATE_CHANGE,
	MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
	MARKETPLACE_SITE_TRANSFER_PLUGIN_INSTALL,
} from 'calypso/state/action-types';
import {
	ISetPluginToBeInstalledAction,
	ISetPrimaryDomainCandidateAction,
	ISetPluginInstalledDuringPurchaseFlag,
	MARKETPLACE_ASYNC_PROCESS_STATUS,
} from 'calypso/state/marketplace/types';
import {
	getPurchaseFlowState,
	getIsPluginInformationLoaded,
} from 'calypso/state/marketplace/purchase-flow/selectors';
import { fetchSitePlugins, installPlugin } from 'calypso/state/plugins/installed/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors';
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import {
	PLUGIN_INSTALLATION_COMPLETED,
	PLUGIN_INSTALLATION_IN_PROGRESS,
	PLUGIN_INSTALLATION_ERROR,
} from 'calypso/state/plugins/installed/status/constants';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin as getWporgPlugin } from 'calypso/state/plugins/wporg/selectors';
import { IAppState } from 'calypso/state/types';
import { marketplaceDebugger } from 'calypso/my-sites/marketplace/constants';

export function setPrimaryDomainCandidate(
	domainName: string | undefined
): ISetPrimaryDomainCandidateAction {
	return {
		type: MARKETPLACE_PRIMARY_DOMAIN_SELECT,
		domainName,
	};
}

export function setPluginSlugToBeInstalled(
	pluginSlugToBeInstalled: string | undefined
): ISetPluginToBeInstalledAction {
	return {
		type: MARKETPLACE_QUEUE_PLUGIN_INSTALL,
		pluginSlugToBeInstalled,
	};
}

export function setIsPluginInstalledDuringPurchase(
	isPluginInstalledDuringPurchase: boolean
): ISetPluginInstalledDuringPurchaseFlag {
	return {
		type: MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE,
		isPluginInstalledDuringPurchase,
	};
}

export function resetPurchaseFlow(): AnyAction {
	return {
		type: MARKETPLACE_RESET_PURCHASE_FLOW,
	};
}

export function siteTransferStateChange(
	state: MARKETPLACE_ASYNC_PROCESS_STATUS,
	reason = 'NOT_PROVIDED'
): AnyAction {
	return {
		type: MARKETPLACE_SITE_TRANSFER_STATE_CHANGE,
		state,
		reason,
	};
}

/**
 * This action is triggered when there is a site transfer performed along with a plugin install
 */
export function siteTransferWithPluginInstallTriggered(): AnyAction {
	return {
		type: MARKETPLACE_SITE_TRANSFER_PLUGIN_INSTALL,
	};
}

export function pluginInstallationStateChange(
	state: MARKETPLACE_ASYNC_PROCESS_STATUS,
	reason: string
): AnyAction {
	return {
		type: MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
		state,
		reason: reason ?? 'NOT_PROVIDED',
	};
}

export function tryPluginInstall( selectedSiteId: number, pluginSlugToBeInstalled: string ) {
	return function ( dispatch: Dispatch< AnyAction >, getState: () => IAppState ): void {
		const state = getState();
		const { pluginInstallationStatus } = getPurchaseFlowState( state );

		const pluginOnSite = getPluginOnSite( state, selectedSiteId, pluginSlugToBeInstalled );
		const isPluginInstalled = !! pluginOnSite;
		const wporgPlugin = getWporgPlugin( state, pluginSlugToBeInstalled );

		const pluginStatus = getStatusForPlugin( state, selectedSiteId, pluginSlugToBeInstalled );
		const isPluginInformationLoaded = getIsPluginInformationLoaded(
			state,
			selectedSiteId,
			pluginSlugToBeInstalled
		);
		if ( pluginInstallationStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN ) {
			dispatch( fetchSitePlugins( selectedSiteId ) );
			dispatch( wporgFetchPluginData( pluginSlugToBeInstalled ) );
			dispatch( pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.FETCHING ) );
		} else if ( isPluginInformationLoaded ) {
			if ( ! isPluginInstalled && ( ! wporgPlugin || ! wporgPlugin.slug ) ) {
				// There is no such plugin on wporg so there is something wrong here
				// For some reason plugin information becomes unresponsive just right after a transfer
				// currently we fail silently because it seems to resolve automatically
				// TODO: This blocking experience occurs sometimes, requires investigation and a fix
				marketplaceDebugger(
					'::MARKETPLACE::ERROR:: The wporg plugin details could not be fetched or the slug does not exist, retrying plugin fetch',
					{ wporgPlugin }
				);
				dispatch( fetchSitePlugins( selectedSiteId ) );
				dispatch( wporgFetchPluginData( pluginSlugToBeInstalled ) );
				dispatch( pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.FETCHING ) );
			} else if ( isPluginInstalled || pluginStatus === 'completed' ) {
				// This means the plugin was successfully installed earlier, most probably during purchase
				dispatch( pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED ) );
			} else if ( pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS ) {
				// If not already started, initiate the plugin install
				dispatch( installPlugin( selectedSiteId, wporgPlugin ) );
				dispatch( siteTransferWithPluginInstallTriggered() );
			} else if ( pluginInstallationStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS ) {
				switch ( pluginStatus ) {
					case PLUGIN_INSTALLATION_COMPLETED:
						dispatch( pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED ) );
						break;
					case PLUGIN_INSTALLATION_IN_PROGRESS:
						dispatch(
							pluginInstallationStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS )
						);
						break;
					case PLUGIN_INSTALLATION_ERROR:
						dispatch(
							pluginInstallationStateChange(
								MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
								'Error in plugin installation in the backend'
							)
						);
						break;
				}
			}
		}
	};
}

export function trySiteTransfer( selectedSiteId: number, pluginSlugToBeInstalled: string ) {
	return function ( dispatch: Dispatch< AnyAction >, getState: () => IAppState ): void {
		const state = getState();
		const purchaseFlowState = getPurchaseFlowState( state );
		const { siteTransferStatus } = purchaseFlowState;
		// First, figure out if the site is already transferred
		const { fetchingStatus: isFetchingTransferState, status } = getAutomatedTransfer(
			state,
			selectedSiteId
		);

		if ( siteTransferStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN ) {
			dispatch( fetchAutomatedTransferStatus( selectedSiteId ) );
			dispatch( siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.FETCHING ) );
		} else if ( ! isFetchingTransferState ) {
			switch ( status ) {
				case transferStates.COMPLETE:
					dispatch( siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED ) );
					break;
				case transferStates.NONE:
				case transferStates.REVERTED:
					// The transferStates.NONE state corresponds to when the transfer details request returns the error response with message "An invalid transfer ID was passed.""
					// The transferStates.REVERTED state corresponds to when after a site was reverted
					// These states mean there is no transfer that exists in the current site
					dispatch( initiateThemeTransfer( selectedSiteId, null, pluginSlugToBeInstalled ) );
					dispatch( siteTransferStateChange( MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS ) );
					break;
				case transferStates.REQUEST_FAILURE:
					dispatch(
						siteTransferStateChange(
							MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
							'The transfer state fetch request failed'
						)
					);
					break;
				case transferStates.ERROR:
					dispatch(
						siteTransferStateChange(
							MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR,
							'The fetched backend transfer status indicated an error state'
						)
					);
					break;
				default:
					marketplaceDebugger(
						'::MARKETPLACE::WARNING:: An unrecognized transfer state was ignored',
						{ transferStatus: status },
						{ purchaseFlowState }
					);
			}
		}
	};
}

/**
 * This action is meant to be triggered multiple time times based on changes to states in async processes
 * TODO: Write a comprehensive unit test for this function
 */
export function tryProductInstall() {
	return function ( dispatch: Dispatch< any >, getState: () => IAppState ): void {
		const state = getState();
		const selectedSiteId = getSelectedSiteId( state );
		const { pluginSlugToBeInstalled } = getPurchaseFlowState( state );
		const { pluginInstallationStatus, siteTransferStatus } = getPurchaseFlowState( state );

		if (
			selectedSiteId &&
			pluginSlugToBeInstalled &&
			pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR &&
			siteTransferStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.ERROR
		) {
			if ( siteTransferStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED ) {
				dispatch( trySiteTransfer( selectedSiteId, pluginSlugToBeInstalled ) );
			} else if ( siteTransferStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED ) {
				dispatch( tryPluginInstall( selectedSiteId, pluginSlugToBeInstalled ) );
			}
		}
	};
}
