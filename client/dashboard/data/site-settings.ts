import wpcom from 'calypso/lib/wp';
import type { SiteSettings } from '@automattic/api-core';

export async function fetchSiteSettings( siteId: number ): Promise< SiteSettings > {
	const { settings } = await wpcom.req.get( {
		path: `/sites/${ siteId }/settings`,
		apiVersion: '1.4',
	} );
	return settings;
}

export async function updateSiteSettings(
	siteId: number,
	data: Partial< SiteSettings >
): Promise< Partial< SiteSettings > > {
	const { updated } = await wpcom.req.post(
		{
			path: `/sites/${ siteId }/settings`,
			apiVersion: '1.4',
		},
		data
	);
	return updated;
}
