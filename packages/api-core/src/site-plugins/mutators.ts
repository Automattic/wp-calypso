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

// Remove a plugin (deletes files)
export async function removeSitePlugin( siteId: number, pluginId: string ): Promise< void > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/plugins/${ encodeURIComponent( pluginId ) }/delete`,
		apiVersion: '1.2',
		method: 'POST',
	} );
}
