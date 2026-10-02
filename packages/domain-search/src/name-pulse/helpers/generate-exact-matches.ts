import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * A label ending in a TLD is split on it: "myapp" gives "my.app". The longest
 * TLD wins ("my.studio", not "mystud.io") and at least two characters must
 * remain. `promoteMatchedTld` moves that row to second place.
 */
export function generateExactMatches(
	baseName: string,
	tlds: readonly string[],
	{ promoteMatchedTld = false }: { promoteMatchedTld?: boolean } = {}
): NamePulseDomainResult[] {
	const matchedTld = tlds.reduce< string | undefined >(
		( longest, tld ) =>
			baseName.endsWith( tld ) &&
			baseName.length - tld.length >= 2 &&
			tld.length > ( longest?.length ?? 0 )
				? tld
				: longest,
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
