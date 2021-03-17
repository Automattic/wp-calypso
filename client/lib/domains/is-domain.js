export function isDomain( domainName ) {
	// Remove protocols.
	const name = domainName.replace( /(^\w+:|^)\/\//, '' );
	if ( name.length > 253 ) {
		return false;
	}
	return /^([a-z0-9-_]{1,63}\.)*[a-z0-9-]{1,63}\.[a-z]{2,63}$/i.test( name );
}
