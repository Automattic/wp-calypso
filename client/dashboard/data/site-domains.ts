import wpcom from 'calypso/lib/wp';
import type { Domain } from './types';

export async function fetchSiteDomains( siteId: number ): Promise< Domain[] > {
	const { domains } = await wpcom.req.get( {
		path: `/sites/${ siteId }/domains`,
		apiVersion: '1.2',
	} );

	return domains;
}
