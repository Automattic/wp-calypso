/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

import {
	MARKETPLACE_PRIMARY_DOMAIN_SELECT,
	MARKETPLACE_QUEUE_PLUGIN_INSTALL,
	MARKETPLACE_PLUGIN_INSTALLED_ON_PURCHASE,
} from 'calypso/state/action-types';
import {
	ISetPluginToBeInstalledAction,
	ISetPrimaryDomainCandidateAction,
	ISetPluginInstalledDuringPurchaseFlag,
} from './types';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getPurchaseFlowState } from 'calypso/state/plugins/marketplace/selectors';
import { installPlugin } from 'calypso/state/plugins/installed/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';

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

export function initiatePluginInstall( selectedSiteId: number ) {
	return function ( dispatch: any, getState: () => any ): void {
		const state = getState();
		const isAtomic = isSiteWpcomAtomic( state, selectedSiteId );
		const { pluginSlugToBeInstalled } = getPurchaseFlowState( state );

		if ( pluginSlugToBeInstalled ) {
			if ( isAtomic ) {
				dispatch( installPlugin( selectedSiteId, pluginSlugToBeInstalled ) );
			} else if ( selectedSiteId ) {
				dispatch( initiateThemeTransfer( selectedSiteId, null, pluginSlugToBeInstalled ) );
			}
		}
	};
}
