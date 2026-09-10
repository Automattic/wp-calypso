import { isWpError } from '../error';
import { wpcom } from '../wpcom-fetcher';
import type {
	ApproveStaticSiteImportSessionParams,
	AttachSwitchRunParams,
	StaticSiteImportSession,
	SwitchRun,
} from './types';

export async function createSwitchRun( sourceUrl: string ): Promise< SwitchRun > {
	return wpcom.req.post(
		{
			path: '/switch-runs',
			apiNamespace: 'wpcom/v2',
		},
		{ source_url: sourceUrl }
	);
}

export async function attachSwitchRun( {
	runId,
	destinationBlogId,
}: AttachSwitchRunParams ): Promise< SwitchRun > {
	return wpcom.req.post(
		{
			path: `/switch-runs/${ encodeURIComponent( runId ) }/attach`,
			apiNamespace: 'wpcom/v2',
		},
		{ destination_blog_id: destinationBlogId }
	);
}

/**
 * Start a session for a source URL.
 *
 * No site is involved: reading and rebuilding the source site needs a URL and
 * nothing else, so the session belongs to the user until it is approved.
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

/**
 * Approve a built site and send it to a destination.
 *
 * This is the only call that names a site, and the only one that changes
 * anything. Approval is hash-bound: `archiveHash` has to be the hash the session
 * reported, or the API refuses rather than shipping something the user did not
 * see.
 */
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

/**
 * The API's own error code for a failed request, or null.
 *
 * Several unrelated failures come back as a 409, so the status cannot be used to
 * tell them apart. WP REST errors carry the code on `code`; the older JSON API
 * shape carries it on `error`, and both reach here through the same client.
 */
export function getStaticSiteImportErrorCode( error: unknown ): string | null {
	if ( ! isWpError( error ) ) {
		return null;
	}

	if ( typeof error.code === 'string' ) {
		return error.code;
	}

	return typeof error.error === 'string' ? error.error : null;
}
