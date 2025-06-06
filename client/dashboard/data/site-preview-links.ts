import wpcom from 'calypso/lib/wp';

export interface SitePreviewLink {
	code: string;
	created_at: string;
	expires_at?: string;
}

export async function fetchSitePreviewLinks( siteId: string ): Promise< SitePreviewLink[] > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/preview-links`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function createSitePreviewLink( siteId: string ): Promise< SitePreviewLink > {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/preview-links`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function deleteSitePreviewLink( siteId: string, code: string ): Promise< void > {
	return wpcom.req.post( {
		method: 'DELETE',
		path: `/sites/${ siteId }/preview-links/${ code }`,
		apiNamespace: 'wpcom/v2',
	} );
}
