import { ResponseDomain } from './types';

export function isDomainUpdateable(
	domain: Pick< ResponseDomain, 'pendingTransfer' | 'expired' >
) {
	return ! domain.pendingTransfer && ! domain.expired;
}
