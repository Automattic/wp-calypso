import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * When the label ends with a TLD ("myapp") that TLD gets the shorter label
 * ("my.app"), as long as at least two characters remain.
 */
export function generateExactMatches(
	baseName: string,
	tlds: readonly string[]
): NamePulseDomainResult[] {
	const matchedTld = tlds.find(
		( tld ) => baseName.endsWith( tld ) && baseName.length - tld.length >= 2
	);

	return tlds.map( ( tld ) => {
		const label = tld === matchedTld ? baseName.slice( 0, -tld.length ) : baseName;

		return {
			domain_name: `${ label }.${ tld }`,
			suffix: tld,
			status: NamePulseDomainStatus.WAITING,
			source: 'exact',
		};
	} );
}
