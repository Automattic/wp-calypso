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
