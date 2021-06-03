/**
 * External dependencies
 */
import type { Action } from 'redux';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

import { PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE } from 'calypso/state/action-types';

interface ISetPrimaryDomainCandidateAction extends Action {
	domainName: string | undefined;
}

export function setPrimaryDomainCandidate(
	domainName: string | undefined
): ISetPrimaryDomainCandidateAction {
	return {
		type: PLUGINS_MARKETPLACE_PRIMARY_DOMAIN_CANDIDATE_UPDATE,
		domainName,
	};
}
