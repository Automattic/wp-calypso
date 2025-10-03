import { wpcom } from '../wpcom-fetcher';

export async function unblockSite( siteId: number ): Promise< void > {
	return await wpcom.req.post( {
		path: `/me/block/sites/${ siteId }/delete`,
		apiVersion: '1.1',
	} );
}
