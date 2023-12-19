import { getRootDomain } from 'calypso/lib/domains/utils';

export function isSubdomain( domainName: string ) {
	if ( ! domainName || domainName === '' ) {
		return false;
	}
	domainName = domainName.startsWith( 'www.' ) ? domainName.slice( 4 ) : domainName;
	const isValidSubdomain = Boolean(
		domainName.match(
			/^([a-z0-9_]([a-z0-9\-_]*[a-z0-9_])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/
		)
	);

	return isValidSubdomain && getRootDomain( domainName ) !== domainName;
}
