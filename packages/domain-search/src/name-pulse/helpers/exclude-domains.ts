import type { NamePulseDomainResult } from './types';

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
