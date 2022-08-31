export function getFixedDomainSearch( domainName ) {
	const domain = domainName ?? '';
	return domain
		.trim()
		.toLowerCase()
		.replace( /^(https?:\/\/)?(www[0-9]?\.)?/, '' )
		.replace( /^www[0-9]?\./, '' )
		.replace( /[^a-z0-9-]/, '' );
}
