import { wpcom } from '../wpcom-fetcher';

export async function updateSiteRedirect( siteId: number, location: string ) {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/domains/redirect`,
		apiVersion: '1.1',
		body: { location },
	} );
}
