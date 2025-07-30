import wpcom from 'calypso/lib/wp';
import { SiteSettings } from './site-settings';

// This request returns roughly the same data as fetchSiteSettings
export async function fetchJetpackSettings( siteId: number ): Promise< Partial< SiteSettings > > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
	} );
	return data;
}

export async function updateJetpackSettings( siteId: number, settings: Partial< SiteSettings > ) {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/settings/',
		body: settings,
	} );
}
