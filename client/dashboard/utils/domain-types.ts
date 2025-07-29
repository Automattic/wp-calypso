import { DomainTypes } from 'calypso/data/types';
import type { SiteDomain } from 'calypso/data/types';

export function isTransferrableToWpcom( domain: SiteDomain ) {
	return domain.type === DomainTypes.MAPPED && domain.is_eligible_for_inbound_transfer;
}
