import wpcom from 'calypso/lib/wp';

export interface ReinstallPluginsResponse {
	message: string;
}

export async function reinstallMarketplacePlugins(
	siteId: number
): Promise< ReinstallPluginsResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/marketplace/products/reinstall`,
		apiNamespace: 'wpcom/v2',
	} );
}
