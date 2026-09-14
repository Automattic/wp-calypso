import { wpcom } from '../wpcom-fetcher';
import type { StaticSiteImportSession, SwitchRun, SwitchRunPreview } from './types';

export async function fetchSwitchRun( runId: string ): Promise< SwitchRun > {
	return wpcom.req.get( {
		path: `/switch-runs/${ encodeURIComponent( runId ) }`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchSwitchRunPreview( runId: string ): Promise< SwitchRunPreview > {
	return wpcom.req.get( {
		path: `/switch-runs/${ encodeURIComponent( runId ) }/preview`,
		apiNamespace: 'wpcom/v2',
	} );
}

/**
 * Read a session.
 *
 * The session belongs to the user, not to a site: it can be read before the
 * destination site exists.
 */
export async function fetchStaticSiteImportSession(
	sessionId: string
): Promise< StaticSiteImportSession > {
	return wpcom.req.get( {
		path: `/static-site-import-session/${ encodeURIComponent( sessionId ) }`,
		apiNamespace: 'wpcom/v2',
	} );
}
