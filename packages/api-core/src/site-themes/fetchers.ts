import { wpcom } from '../wpcom-fetcher';
import type { Theme } from './types';

export async function fetchSiteActiveThemes( siteId: number ): Promise< Theme[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/themes?status=active`,
		apiNamespace: 'wp/v2',
	} );
}
