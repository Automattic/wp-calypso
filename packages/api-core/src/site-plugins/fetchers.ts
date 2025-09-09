import { wpcom } from '../wpcom-fetcher';
import type { SitePluginsResponse } from './types';

export async function fetchSitePlugins( siteId: number ): Promise< SitePluginsResponse > {
	return await wpcom.req.get( { path: `/sites/${ siteId }/plugins`, apiNamespace: 'wp/v2' } );
}
