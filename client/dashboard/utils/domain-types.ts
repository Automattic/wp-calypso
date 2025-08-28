import { DomainTypes } from '../data/domains';
import type { SiteDomain } from '../data/types';

export function isTransferrableToWpcom( domain: SiteDomain ) {
	return domain.type === DomainTypes.MAPPED && domain.is_eligible_for_inbound_transfer;
}
