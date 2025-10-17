import { wpcom } from '../wpcom-fetcher';
import type { SitePreviewLink } from './types';

export async function fetchSitePreviewLinks( siteId: number ): Promise< SitePreviewLink[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/preview-links`,
		apiNamespace: 'wpcom/v2',
	} );
}
