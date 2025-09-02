import { wpcom } from '../wpcom-fetcher';
import type { ReinstallPluginsResponse } from './types';

export async function reinstallMarketplacePlugins(
	siteId: number
): Promise< ReinstallPluginsResponse > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/marketplace/products/reinstall`,
		apiNamespace: 'wpcom/v2',
	} );
}
