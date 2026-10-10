import { wpcom } from '../wpcom-fetcher';
import type { StaticSiteImportSession } from './types';

export async function fetchStaticSiteImportSession(
	sessionId: string
): Promise< StaticSiteImportSession > {
	return wpcom.req.get( {
		path: `/static-site-import-session/${ encodeURIComponent( sessionId ) }`,
		apiNamespace: 'wpcom/v2',
	} );
}
