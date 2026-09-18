import { wpcom } from '../wpcom-fetcher';
import type { CreateSiteParams, CreateSiteResponse } from './types';

export async function createSite( params: CreateSiteParams ) {
	return wpcom.req.post(
		{
			path: '/sites/new',
			apiVersion: '1.1',
		},
		{},
		params
	) as Promise< CreateSiteResponse >;
}

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
