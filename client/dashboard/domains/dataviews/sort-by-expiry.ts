export function sortByExpiry(
	a: string | null | undefined,
	b: string | null | undefined,
	direction: string
) {
	if ( a == null && b == null ) {
		return 0;
	}
	if ( a == null ) {
		return 1;
	}
	if ( b == null ) {
		return -1;
	}

	const factor = direction === 'asc' ? 1 : -1;
	return a.localeCompare( b ) * factor;
}
