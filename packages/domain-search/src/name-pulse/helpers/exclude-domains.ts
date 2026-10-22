import type { NamePulseDomainResult } from './types';

export const excludeDomains = (
	results: NamePulseDomainResult[],
	...listed: NamePulseDomainResult[][]
): NamePulseDomainResult[] => {
	const names = new Set( listed.flat().map( ( result ) => result.domain_name ) );

	return results.filter( ( result ) => ! names.has( result.domain_name ) );
};
