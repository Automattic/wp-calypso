import { wpcom } from '../wpcom-fetcher';
import type {
	ApproveStaticSiteImportSessionParams,
	StaticSiteImportHandoffParams,
	StaticSiteImportSession,
} from './types';

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
	destinationBlogId,
}: ApproveStaticSiteImportSessionParams ): Promise< StaticSiteImportSession > {
	return wpcom.req.post(
		{
			path: `/static-site-import-session/${ encodeURIComponent( sessionId ) }/approve`,
			apiNamespace: 'wpcom/v2',
		},
		{ destination_blog_id: destinationBlogId }
	);
}

/**
 * Hands the move to our migrations team: the server opens a Zendesk migration ticket for the
 * site, tagged as a non-WordPress source, unless one is already open.
 */
export async function requestStaticSiteImportHandoff( {
	blogUrl,
	fromUrl,
	locale,
	importSessionId,
}: StaticSiteImportHandoffParams ): Promise< { success: boolean } > {
	return wpcom.req.post(
		{
			path: '/help/migration-ticket/new',
			apiNamespace: 'wpcom/v2',
		},
		{
			blog_url: blogUrl,
			from_url: fromUrl,
			locale,
			context: 'site_is_not_wordpress',
			import_session_id: importSessionId,
		}
	);
}
