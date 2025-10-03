import { wpcom } from '../wpcom-fetcher';

export async function deleteSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/delete`,
	} );
}

export async function launchSite( siteId: number ) {
	return wpcom.req.post( {
		path: `/sites/${ siteId }/launch`,
	} );
}

export async function restoreSite( siteId: number ) {
	return wpcom.req.post(
		{
			path: '/restore-site',
			apiNamespace: 'wpcom/v2',
			method: 'put',
		},
		{
			site_id: siteId,
		}
	);
}
