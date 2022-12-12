/**
 * Parse the root domain part from a given domain name. e.g.
 * foo.wordpress.com should return wordpress.com.
 * foo.blog should return foo.blog.
 */
export function getRootDomain( domainName ) {
	const firstLastDot = domainName.lastIndexOf( '.' );

	if ( firstLastDot === -1 ) {
		return domainName;
	}

	const secondLastDot = domainName.lastIndexOf( '.', firstLastDot - 1 );

	if ( secondLastDot === -1 ) {
		return domainName;
	}

	return domainName.substring( secondLastDot + 1 );
}
