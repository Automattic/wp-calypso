import { wpcom } from '../wpcom-fetcher';
import type { SitePluginsResponse, CorePlugin, SitePlugin } from './types';

export async function fetchSitePlugin( siteId: number, pluginSlug: string ): Promise< SitePlugin > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/plugins/${ pluginSlug }`,
		apiVersion: '1.2',
	} );
}

export async function fetchSitePlugins( siteId: number ): Promise< SitePluginsResponse > {
	return await wpcom.req.get( { path: `/sites/${ siteId }/plugins`, apiVersion: '1.2' } );
}

export async function fetchSiteCorePlugins( siteId: number ): Promise< CorePlugin[] > {
	return await wpcom.req.get( {
		path: `/sites/${ siteId }/plugins`,
		apiNamespace: 'wp/v2',
	} );
}
