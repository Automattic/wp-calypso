export function doesStringResembleDomain( domainOrProduct: string ): boolean {
	try {
		// Domain names should all contain a dot.
		const hasDot = domainOrProduct.includes( '.' );
		if ( ! hasDot ) {
			return false;
		}

		// Subdomain site slugs contain the install path after two colons.
		const domainBeforeColons = domainOrProduct.split( '::' )[ 0 ];

		// Domains should be able to become a valid URL.
		// eslint-disable-next-line no-new
		new URL( 'http://' + domainBeforeColons );
		return true;
	} catch {}
	return false;
}
