import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export type SiteDomain = Omit< DomainSummary, 'domain_status' >;

export async function fetchSiteDomains( siteId: number ): Promise< SiteDomain[] > {
	const { domains } = await wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );

	return domains;
}

export async function setPrimaryDomain( siteId: number, domain: string ): Promise< SiteDomain > {
	return wpcom.req.post( `/sites/${ siteId }/domains/primary`, { domain } );
}
