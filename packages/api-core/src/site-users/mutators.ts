import { wpcom } from '../wpcom-fetcher';
import type { SiteUser, SiteUserMeta } from './types';

export async function deleteSiteUser( siteId: number, userId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/users/${ userId }/delete`,
	} );
}

export async function updateCurrentSiteUserMeta(
	siteId: number,
	meta: SiteUserMeta
): Promise< SiteUser > {
	return wpcom.req.post( {
		apiNamespace: 'wp/v2',
		path: `/sites/${ siteId }/users/me`,
		body: { meta },
	} );
}
