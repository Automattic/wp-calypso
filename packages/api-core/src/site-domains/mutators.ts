import { wpcom } from '../wpcom-fetcher';

export const ATOMIC_PRIMARY_DOMAIN_CHANGE_FAILED = 'atomic_primary_domain_change_failed';

/**
 * WP Cloud refused the change on an Atomic site. The server tries to restore the previous
 * primary domain, but that can fail too, so callers should re-fetch the site's domains.
 */
export function isAtomicPrimaryDomainChangeFailed( error: unknown ): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		( error as { error?: unknown } ).error === ATOMIC_PRIMARY_DOMAIN_CHANGE_FAILED
	);
}

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< void > {
	await wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
}
