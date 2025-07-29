import wpcom from 'calypso/lib/wp';
import type { Domain } from './domains';

export type SiteDomain = Omit< Domain, 'domain_status' >;

export async function fetchSiteDomains( siteId: number ): Promise< SiteDomain[] > {
	const { domains } = await wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );

	return domains;
}
