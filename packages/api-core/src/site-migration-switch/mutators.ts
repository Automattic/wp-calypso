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

export async function createStaticSiteImportSession(
	siteId: number,
	sourceUrl: string
): Promise< StaticSiteImportSession > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/static-site-import-session`,
			apiNamespace: 'wpcom/v2',
		},
		{ source_url: sourceUrl }
	);
}

export async function approveStaticSiteImportSession( {
	siteId,
	sessionId,
	planHash,
}: ApproveStaticSiteImportSessionParams ): Promise< StaticSiteImportSession > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/static-site-import-session/${ encodeURIComponent(
				sessionId
			) }/approve`,
			apiNamespace: 'wpcom/v2',
		},
		{ plan_hash: planHash }
	);
}

/**
 * Approval is hash-bound: the API rejects a `plan_hash` that no longer matches
 * the plan it would apply with a 409, meaning the preview the user approved is
 * stale and has to be re-read before approving again.
 */
export function isStaticSiteImportPlanHashMismatch( error: unknown ): boolean {
	return isWpError( error ) && error.status === 409;
}
