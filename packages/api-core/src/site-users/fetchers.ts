import { wpcom } from '../wpcom-fetcher';
import type { SiteUser } from './types';

export async function fetchCurrentSiteUser( siteId: number ): Promise< SiteUser > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/users/me`,
		apiNamespace: 'wp/v2',
	} );
}
