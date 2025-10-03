import { DomainSubtype } from '@automattic/api-core';
import type { SiteDomain } from '@automattic/api-core';

export function isTransferrableToWpcom( domain: SiteDomain ) {
	return (
		domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION && domain.is_eligible_for_inbound_transfer
	);
}
