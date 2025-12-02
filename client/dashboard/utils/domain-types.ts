import { DomainSubtype } from '@automattic/api-core';
import type { DomainSummary } from '@automattic/api-core';

export function isTransferrableToWpcom( domain: DomainSummary ) {
	return domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION;
}
