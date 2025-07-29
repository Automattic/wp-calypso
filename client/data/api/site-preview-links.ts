import wpcom from 'calypso/lib/wp';

export interface SitePreviewLink {
	code: string;
	created_at: string;
	expires_at?: string;
}

export async function fetchSitePreviewLinks( siteId: number ): Promise< SitePreviewLink[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/preview-links`,
		apiNamespace: 'wpcom/v2',
	} );
}

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
