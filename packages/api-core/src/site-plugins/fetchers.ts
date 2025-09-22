import { wpcom } from '../wpcom-fetcher';
import type { SitePluginsResponse, CorePlugin, SitePlugin } from './types';

export function fetchSitePlugin( site: number, pluginId: string ): Promise< SitePlugin > {
	return wpcom.req.get( {
		path: `/sites/${ site }/plugins/${ pluginId }`,
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
