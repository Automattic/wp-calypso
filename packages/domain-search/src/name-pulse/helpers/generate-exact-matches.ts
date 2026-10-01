import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * When the label ends with a TLD ("myapp") that TLD gets the shorter label
 * ("my.app"), as long as at least two characters remain. The longest such TLD
 * wins, so "mystudio" is "my.studio", not "mystud.io". With `promoteMatchedTld`
 * that row moves to the second slot.
 */
export function generateExactMatches(
	baseName: string,
	tlds: readonly string[],
	{ promoteMatchedTld = false }: { promoteMatchedTld?: boolean } = {}
): NamePulseDomainResult[] {
	const matchedTld = tlds
		.filter( ( tld ) => baseName.endsWith( tld ) && baseName.length - tld.length >= 2 )
		.reduce< string | undefined >(
			( longest, tld ) => ( ! longest || tld.length > longest.length ? tld : longest ),
			undefined
		);

	const ordered = [ ...tlds ];

	if ( promoteMatchedTld && matchedTld ) {
		ordered.splice( ordered.indexOf( matchedTld ), 1 );
		ordered.splice( 1, 0, matchedTld );
	}

	return ordered.map( ( tld ) => {
		const label = tld === matchedTld ? baseName.slice( 0, -tld.length ) : baseName;

		return {
			domain_name: `${ label }.${ tld }`,
			suffix: tld,
			status: NamePulseDomainStatus.WAITING,
			source: 'exact',
		};
	} );
}
