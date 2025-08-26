import wpcom from 'calypso/lib/wp';

export interface BlockedSite {
	ID: number;
	URL: string;
	name: string;
}

export interface BlockedSiteResponse {
	sites: BlockedSite[];
	page: number;
}

export async function fetchBlockedSites(): Promise< BlockedSiteResponse > {
	return await wpcom.req.get( {
		path: '/me/blocks/sites',
		apiNamespace: 'wpcom/v2',
	} );
}

export async function unblockSite( siteId: number ): Promise< void > {
	return await wpcom.req.post( {
		path: `/me/block/sites/${ siteId }/delete`,
		apiVersion: '1.1',
	} );
}
