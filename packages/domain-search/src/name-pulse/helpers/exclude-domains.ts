import type { NamePulseDomainResult } from './types';

/**
 * Drop rows whose domain already appears in an earlier section. Sections are
 * ranked Top results → Exact match → Related → Creative; each excludes every
 * row of the sections above it (the full lists, not only the visible rows, so
 * a section never loses rows when the one above it expands).
 */
export const excludeDomains = (
	results: NamePulseDomainResult[],
	excluded: ReadonlySet< string >
): NamePulseDomainResult[] => {
	if ( results.length === 0 || excluded.size === 0 ) {
		return results;
	}

	const filtered = results.filter( ( result ) => ! excluded.has( result.domain_name ) );

	return filtered.length === results.length ? results : filtered;
};

export const toDomainNameSet = (
	...lists: ReadonlyArray< ReadonlyArray< Pick< NamePulseDomainResult, 'domain_name' > > >
): Set< string > => {
	const names = new Set< string >();

	for ( const list of lists ) {
		for ( const result of list ) {
			names.add( result.domain_name );
		}
	}

	return names;
};
