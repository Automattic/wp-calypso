import {
	MARKETPLACE_PRIMARY_DOMAIN_SELECT,
	MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
	MARKETPLACE_QUEUE_PRODUCT_INSTALL,
} from 'calypso/state/action-types';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import type { AnyAction } from 'redux';
import 'calypso/state/marketplace/init';

export function setPrimaryDomainCandidate( domainName: string | undefined ): AnyAction {
	return {
		type: MARKETPLACE_PRIMARY_DOMAIN_SELECT,
		domainName,
	};
}

export function productToBeInstalled( productSlug: string, primaryDomain: string ): AnyAction {
	return {
		type: MARKETPLACE_QUEUE_PRODUCT_INSTALL,
		productSlug,
		primaryDomain,
	};
}

export function pluginInstallationStateChange(
	state: MARKETPLACE_ASYNC_PROCESS_STATUS,
	reason = 'Not provided.'
): AnyAction {
	return {
		type: MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
		state,
		reason: reason,
	};
}
