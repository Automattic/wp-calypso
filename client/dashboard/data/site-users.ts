import wpcom from 'calypso/lib/wp';

export interface SiteUser {
	id: number;
}

export async function fetchCurrentSiteUser( siteId: string ): Promise< SiteUser > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/users/me`,
		apiNamespace: 'wp/v2',
	} );
}

export async function deleteSiteUser( siteId: string, userId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/users/${ userId }/delete`,
	} );
}
