import { wpcom } from '../wpcom-fetcher';
import type { SitePlugin } from './types';

// Activate a plugin on a site
export async function activateSitePlugin(
	siteId: number,
	pluginId: string
): Promise< SitePlugin > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }`,
			apiVersion: '1.2',
		},
		{ active: true }
	);
}

// Deactivate a plugin on a site
export async function deactivateSitePlugin(
	siteId: number,
	pluginId: string
): Promise< SitePlugin > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }`,
			apiVersion: '1.2',
		},
		{ active: false }
	);
}

// Update a plugin on a site
export async function updateSitePlugin( siteId: number, pluginId: string ): Promise< SitePlugin > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }/update`,
		apiVersion: '1.2',
	} );
}

// Enable autoupdates for a plugin
export async function enableSitePluginAutoupdate(
	siteId: number,
	pluginId: string
): Promise< SitePlugin > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }`,
			apiVersion: '1.2',
		},
		{ autoupdate: true }
	);
}

// Disable autoupdates for a plugin
export async function disableSitePluginAutoupdate(
	siteId: number,
	pluginId: string
): Promise< SitePlugin > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }`,
			apiVersion: '1.2',
		},
		{ autoupdate: false }
	);
}

// Install a plugin by slug
export async function installSitePlugin( siteId: number, slug: string ): Promise< SitePlugin > {
	return wpcom.req.post( { path: `/sites/${ siteId }/plugins/new`, apiVersion: '1.2' }, { slug } );
}

// Install and activate a plugin by slug via the WordPress Core (wp/v2) endpoint.
export async function installSiteCorePlugin( siteId: number, slug: string ): Promise< void > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/plugins`,
		body: {
			slug,
			status: 'active',
		},
	} );
}

// Activate a plugin via the WordPress Core (wp/v2) endpoint. `plugin` is the plugin file path
// (e.g. "woocommerce/woocommerce") and is intentionally not URL-encoded to match the endpoint.
export async function activateSiteCorePlugin( siteId: number, plugin: string ): Promise< void > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/plugins/${ plugin }`,
		body: {
			status: 'active',
		},
	} );
}

// Remove a plugin (deletes files)
export async function removeSitePlugin( siteId: number, pluginId: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }/delete`,
		apiVersion: '1.2',
		method: 'POST',
	} );
}
