import { wpcom } from '../wpcom-fetcher';
import type { ApproveStaticSiteImportSessionParams, StaticSiteImportSession } from './types';

/**
 * Starts a session for a public HTTPS URL. Starting the same URL again while its
 * session is live returns that session instead of a new one.
 */
export async function createStaticSiteImportSession(
	sourceUrl: string
): Promise< StaticSiteImportSession > {
	return wpcom.req.post(
		{
			path: '/static-site-import-session',
			apiNamespace: 'wpcom/v2',
		},
		{ source_url: sourceUrl }
	);
}

export async function approveStaticSiteImportSession( {
	sessionId,
	archiveHash,
	destinationBlogId,
}: ApproveStaticSiteImportSessionParams ): Promise< StaticSiteImportSession > {
	return wpcom.req.post(
		{
			path: `/static-site-import-session/${ encodeURIComponent( sessionId ) }/approve`,
			apiNamespace: 'wpcom/v2',
		},
		{ archive_hash: archiveHash, destination_blog_id: destinationBlogId }
	);
}
