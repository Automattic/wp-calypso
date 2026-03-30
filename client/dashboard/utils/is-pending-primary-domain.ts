import { DomainSubtype } from '@automattic/api-core';
import type { DomainSummary } from '@automattic/api-core';

/**
 * Returns true if a domain is a registration that should become primary but
 * the background job hasn't completed yet. Used on CIAB dashboards to show
 * a "setting up" notice.
 */
export function isPendingPrimaryDomain( domain: DomainSummary ): boolean {
	return (
		domain.subtype.id === DomainSubtype.DOMAIN_REGISTRATION &&
		domain.can_set_as_primary &&
		! domain.primary_domain
	);
}
