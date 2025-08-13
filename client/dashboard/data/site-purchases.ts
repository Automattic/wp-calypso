import wpcom from 'calypso/lib/wp';
import type { Purchase } from './purchase';

export async function fetchSitePurchases( siteId: number | string ): Promise< Purchase[] > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/purchases`,
		apiVersion: '1.1',
	} );
}
