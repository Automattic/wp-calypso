import wpcom from 'calypso/lib/wp';

export interface BlockedSite {
	ID: number;
	URL: string;
	name: string;
}

export async function fetchBlockedSites( page: number, perPage: number ): Promise< BlockedSite[] > {
	const { sites } = await wpcom.req.get(
		{
			path: '/me/blocks/sites',
			apiNamespace: 'wpcom/v2',
		},
		{
			page,
			per_page: perPage,
		}
	);

	return sites;
}

export async function unblockSite( siteId: number ): Promise< void > {
	return await wpcom.req.post( {
		path: `/me/block/sites/${ siteId }/delete`,
		apiVersion: '1.1',
	} );
}
