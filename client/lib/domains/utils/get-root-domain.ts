import { getTld } from 'calypso/lib/domains';

export function getRootDomain( domainName: string ): string {
	if ( ! domainName ) {
		return '';
	}

	const domainNameParts = domainName.split( '.' );
	const tldParts = getTld( domainName ).split( '.' );

	const rootDomainParts = domainNameParts.slice( -( tldParts.length + 1 ) );

	return rootDomainParts.join( '.' );
}
