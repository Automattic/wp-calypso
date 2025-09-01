import { DomainTypes } from '@automattic/api-core';
import type { SiteDomain } from '@automattic/api-core';

export function isTransferrableToWpcom( domain: SiteDomain ) {
	return domain.type === DomainTypes.MAPPED && domain.is_eligible_for_inbound_transfer;
}
