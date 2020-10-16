export function parseDomainAgainstTldList( domainFragment, tldList ) {
	if ( ! domainFragment ) {
		return '';
	}

	if ( tldList[ domainFragment ] !== undefined ) {
		return domainFragment;
	}

	const parts = domainFragment.split( '.' );
	parts.shift();
	const suffix = parts.join( '.' );

	return parseDomainAgainstTldList( suffix, tldList );
}
