import { wpcom } from '../wpcom-fetcher';

export async function resetSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/reset-site`,
		apiNamespace: 'wpcom/v2',
	} );
}
