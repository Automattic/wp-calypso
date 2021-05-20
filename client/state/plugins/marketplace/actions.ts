/**
 * External dependencies
 */
import type { Action } from 'redux';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

import { PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_UPDATE } from 'calypso/state/action-types';

interface ISetPrimaryDomainAction extends Action {
	domainName: string | undefined;
}

export function setPrimaryDomain( domainName: string | undefined ): ISetPrimaryDomainAction {
	return {
		type: PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_UPDATE,
		domainName,
	};
}
