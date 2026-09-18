import { wpcom } from '../wpcom-fetcher';
import type { StaticSiteImportSession } from './types';

export async function createStaticSiteImportSession( siteId: number, sourceUrl: string ) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/static-site-import-session`,
			apiNamespace: 'wpcom/v2',
		},
		{ source_url: sourceUrl }
	) as Promise< StaticSiteImportSession >;
}

export async function approveStaticSiteImportSession(
	siteId: number,
	sessionId: string,
	planHash: string
) {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/static-site-import-session/${ sessionId }/approve`,
			apiNamespace: 'wpcom/v2',
		},
		{ plan_hash: planHash }
	) as Promise< StaticSiteImportSession >;
}
