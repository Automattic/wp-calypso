import { wpcom } from '../wpcom-fetcher';
import type { SiteUser, WpcomSiteUser, WpcomSiteUsersResponse } from './types';

export async function fetchCurrentSiteUser( siteId: number ): Promise< SiteUser > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/users/me`,
		apiNamespace: 'wp/v2',
	} );
}

export async function fetchSiteUsers( siteId: number ): Promise< SiteUser[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/users`,
		apiNamespace: 'wp/v2',
	} );
}

export async function fetchWpcomSiteUsers(
	siteId: number,
	options?: { role?: string }
): Promise< WpcomSiteUser[] > {
	const response: WpcomSiteUsersResponse = await wpcom.req.get( {
		path: `/sites/${ siteId }/users`,
		apiVersion: '1.1',
		query: {
			force: 'wpcom',
			...options,
		},
	} );
	return response.users;
}
