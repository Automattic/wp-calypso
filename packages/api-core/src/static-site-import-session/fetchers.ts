import { wpcom } from '../wpcom-fetcher';
import type { StaticSiteImportSession } from './types';

export async function fetchStaticSiteImportSession( siteId: number, sessionId: string ) {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/static-site-import-session/${ sessionId }`,
		apiNamespace: 'wpcom/v2',
	} ) as Promise< StaticSiteImportSession >;
}
