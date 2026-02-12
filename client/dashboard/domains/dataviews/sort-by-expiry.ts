import type { DomainSummary } from '@automattic/api-core';

export function sortByExpiry(
	a: Pick< DomainSummary, 'expiry' >,
	b: Pick< DomainSummary, 'expiry' >,
	direction: string
) {
	if ( a.expiry == null && b.expiry == null ) {
		return 0;
	}
	if ( a.expiry == null ) {
		return 1;
	}
	if ( b.expiry == null ) {
		return -1;
	}

	const factor = direction === 'asc' ? 1 : -1;
	return a.expiry.localeCompare( b.expiry ) * factor;
}
