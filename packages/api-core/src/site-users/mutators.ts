import { wpcom } from '../wpcom-fetcher';

export async function deleteSiteUser( siteId: number, userId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/users/${ userId }/delete`,
	} );
}
