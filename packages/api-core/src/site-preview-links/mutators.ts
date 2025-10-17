import { wpcom } from '../wpcom-fetcher';
import type { SitePreviewLink } from './types';

export async function createSitePreviewLink( siteId: number ): Promise< SitePreviewLink > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/preview-links`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteSitePreviewLink( siteId: number, code: string ) {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ siteId }/preview-links/${ code }`,
		apiNamespace: 'wpcom/v2',
	} );
}
