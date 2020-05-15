export function getFixedDomainSearch( domainName ) {
	return domainName
		.trim()
		.toLowerCase()
		.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
		.replace( /^www[0-9]?\./, '' )
		.replace( /\/$/, '' )
		.replace( /_/g, '-' )
		.replace( /^\.+|\.+$/, '' );
}
