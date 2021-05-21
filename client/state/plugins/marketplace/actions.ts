/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

import {
	PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE,
	PLUGINS_MARKETPLACE_SET_PLUGIN_TO_BE_INSTALLED,
	PLUGINS_MARKETPLACE_SET_IS_PLUGIN_INSTALLED_DURING_PURCHASE,
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
		type: PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE,
		domainName,
	};
}

export function setPluginSlugToBeInstalled(
	pluginSlugToBeInstalled: string | undefined
): ISetPluginToBeInstalledAction {
	return {
		type: PLUGINS_MARKETPLACE_SET_PLUGIN_TO_BE_INSTALLED,
		pluginSlugToBeInstalled,
	};
}

export function setIsPluginInstalledDuringPurchase(
	isPluginInstalledDuringPurchase: boolean
): ISetPluginInstalledDuringPurchaseFlag {
	return {
		type: PLUGINS_MARKETPLACE_SET_IS_PLUGIN_INSTALLED_DURING_PURCHASE,
		isPluginInstalledDuringPurchase,
	};
}
