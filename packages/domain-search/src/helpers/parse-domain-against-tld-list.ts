export function parseDomainAgainstTldList( domainFragment: string, tldList: string[] ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList.includes( domainFragment ) ) {
		return domainFragment;
	}

	const parts = domainFragment.split( '.' );
	const suffix = parts.slice( 1 ).join( '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}
