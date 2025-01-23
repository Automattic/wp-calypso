import { getRootDomain } from 'calypso/lib/domains/utils';

export function isSubdomain( domainName: string, tld?: string ): boolean {
	if ( ! domainName || domainName === '' ) {
		return false;
	}

	if ( tld && domainName.endsWith( tld ) ) {
		return false;
	}

	const isValidSubdomain = Boolean(
		domainName.match(
			/^([a-z0-9_]([a-z0-9\-_]*[a-z0-9_])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,63}$/
		)
	);

	return isValidSubdomain && getRootDomain( domainName ) !== domainName;
}
