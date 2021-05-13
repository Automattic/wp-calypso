export function getTopLevelOfTld( domainName ) {
	return domainName.substring( domainName.lastIndexOf( '.' ) + 1 );
}
