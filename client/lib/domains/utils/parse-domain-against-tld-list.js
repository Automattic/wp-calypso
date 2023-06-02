export function parseDomainAgainstTldList( domainFragment, tldList ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList[ domainFragment ] !== undefined ) {
		return domainFragment;
	}

	const parts = domainFragment.split( '.' );
	const suffix = parts.slice( 1 ).join( '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}
