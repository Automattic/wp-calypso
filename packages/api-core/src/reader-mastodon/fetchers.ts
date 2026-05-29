import { wpcom } from '../wpcom-fetcher';
import { classifyMastodonError, type MastodonError } from './errors';
import type {
	MastodonAccountSummariesPage,
	MastodonAuthStatus,
	MastodonCreateLikeParams,
	MastodonDeleteLikeParams,
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonInstanceConfig,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonCreateFollowParams,
	MastodonCreatePostParams,
	MastodonCreatePostResult,
	MastodonCreateRepostParams,
	MastodonDeleteFollowParams,
	MastodonDeleteRepostParams,
	MastodonFollowResponse,
	MastodonMediaUploadParams,
	MastodonMediaUploadResult,
	MastodonNotificationsPage,
	MastodonTagFilter,
	MastodonTagFeedPage,
	MastodonThreadResponse,
	MastodonTimelinePage,
} from './types';

const NAMESPACE = 'wpcom/v2';

export async function getMastodonConnections(): Promise< MastodonConnectionsResponse > {
	try {
		return ( await wpcom.req.get( {
			path: '/reader/mastodon/connections',
			apiNamespace: NAMESPACE,
		} ) ) as MastodonConnectionsResponse;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface AuthorizeMastodonConnectionParams {
	instance: string;
}

export async function authorizeMastodonConnection(
	params: AuthorizeMastodonConnectionParams
): Promise< MastodonAuthorizeResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/mastodon/connections',
			apiNamespace: NAMESPACE,
			body: { step: 'authorize', ...params },
		} ) ) as MastodonAuthorizeResponse;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface CompleteMastodonConnectionParams {
	state: string;
	code: string;
}

export async function completeMastodonConnection(
	params: CompleteMastodonConnectionParams
): Promise< MastodonCreateConnectionResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/mastodon/connections',
			apiNamespace: NAMESPACE,
			body: { step: 'complete', ...params },
		} ) ) as MastodonCreateConnectionResponse;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function getMastodonConnection( id: number ): Promise< MastodonConnectionDetails > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/mastodon/connections/${ id }`,
			apiNamespace: NAMESPACE,
		} ) ) as MastodonConnectionDetails;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function getMastodonAuthStatus( id: number ): Promise< MastodonAuthStatus > {
	let raw: unknown;
	try {
		raw = await wpcom.req.get( {
			path: `/reader/mastodon/connections/${ id }/auth-status`,
			apiNamespace: NAMESPACE,
		} );
	} catch ( err ) {
		throw classifyMastodonError( err );
	}
	// Validate the wire shape rather than blindly casting. A backend response
	// where `needs_reauth` is missing / non-boolean would otherwise type as
	// `MastodonAuthStatus` with `needs_reauth: undefined`, and the gate's
	// `!== true` check would silently treat it as healthy.
	if (
		typeof raw !== 'object' ||
		raw === null ||
		typeof ( raw as { needs_reauth?: unknown } ).needs_reauth !== 'boolean'
	) {
		throw { kind: 'unknown', cause: raw } satisfies MastodonError;
	}
	return raw as MastodonAuthStatus;
}

export async function getMastodonInstanceConfig(
	connectionId: number
): Promise< MastodonInstanceConfig > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/mastodon/connections/${ connectionId }/instance-config`,
			apiNamespace: NAMESPACE,
		} ) ) as MastodonInstanceConfig;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonTimelineParams {
	connectionId: number;
	cursor?: string;
	limit?: number;
}

export async function getMastodonTimeline(
	params: GetMastodonTimelineParams
): Promise< MastodonTimelinePage > {
	const { connectionId, cursor, limit } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/mastodon/connections/${ connectionId }/timeline`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as MastodonTimelinePage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonNotificationsParams {
	connectionId: number;
	cursor?: string;
	limit?: number;
	types?: string;
}

export async function getMastodonNotifications(
	params: GetMastodonNotificationsParams
): Promise< MastodonNotificationsPage > {
	const { connectionId, cursor, limit, types } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	if ( types ) {
		query.types = types;
	}
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/mastodon/connections/${ connectionId }/notifications`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as MastodonNotificationsPage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonThreadParams {
	connectionId: number;
	statusId: string;
}

export async function getMastodonThread(
	params: GetMastodonThreadParams
): Promise< MastodonThreadResponse > {
	const { connectionId, statusId } = params;
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/mastodon/connections/${ connectionId }/thread`,
				apiNamespace: NAMESPACE,
			},
			{ status_id: statusId }
		) ) as MastodonThreadResponse;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonAuthorProfileParams {
	connectionId: number;
	actor: string;
}

export async function getMastodonAuthorProfile(
	params: GetMastodonAuthorProfileParams
): Promise< MastodonAuthorProfile > {
	const { connectionId, actor } = params;
	try {
		return ( await wpcom.req.get( {
			// `actor` flows in from federated mention anchors and route
			// segments; encode so a crafted handle can't smuggle slashes
			// or query separators into the request path.
			path: `/reader/mastodon/connections/${ connectionId }/profile/${ encodeURIComponent(
				actor
			) }`,
			apiNamespace: NAMESPACE,
		} ) ) as MastodonAuthorProfile;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonAuthorFeedParams {
	connectionId: number;
	actor: string;
	cursor?: string;
	limit?: number;
	filter?: MastodonAuthorFeedFilter;
}

export async function getMastodonAuthorFeed(
	params: GetMastodonAuthorFeedParams
): Promise< MastodonAuthorFeedPage > {
	const { connectionId, actor, cursor, limit, filter } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	// Mastodon's `/api/v1/accounts/:id/statuses` exposes filters as two
	// independent booleans on the same endpoint. `posts_with_replies` and
	// `undefined` send neither — that's the API default (posts + replies).
	if ( filter === 'posts_no_replies' ) {
		query.exclude_replies = 'true';
	} else if ( filter === 'posts_with_media' ) {
		query.only_media = 'true';
	}
	try {
		return ( await wpcom.req.get(
			{
				// Encode `actor`; see getMastodonAuthorProfile for rationale.
				path: `/reader/mastodon/connections/${ connectionId }/profile/${ encodeURIComponent(
					actor
				) }/feed`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as MastodonAuthorFeedPage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonTagFeedParams {
	connectionId: number;
	hashtag: string;
	cursor?: string;
	limit?: number;
	filter?: MastodonTagFilter;
}

export async function getMastodonTagFeed(
	params: GetMastodonTagFeedParams
): Promise< MastodonTagFeedPage > {
	const { connectionId, hashtag, cursor, limit, filter } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	// Mastodon's `/api/v1/timelines/tag/:hashtag` exposes `only_media` and
	// `local` as independent boolean params. `all` and undefined send neither.
	if ( filter === 'media' ) {
		query.only_media = 'true';
	} else if ( filter === 'local' ) {
		query.local = 'true';
	}
	try {
		return ( await wpcom.req.get(
			{
				// Encode `hashtag` defensively; HASHTAG_RE-validated values
				// contain no chars that need escaping today, but encoding
				// keeps the request path safe if the validator widens later.
				path: `/reader/mastodon/connections/${ connectionId }/tag/${ encodeURIComponent(
					hashtag
				) }/feed`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as MastodonTagFeedPage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export interface GetMastodonActorPageParams {
	connectionId: number;
	actor: string;
	cursor?: string;
	limit?: number;
}

const DEFAULT_ACTOR_PAGE_LIMIT = 40;

function buildActorPageQuery(
	cursor: string | undefined,
	limit: number | undefined
): Record< string, string > {
	const out: Record< string, string > = {
		limit: String( limit ?? DEFAULT_ACTOR_PAGE_LIMIT ),
	};
	if ( cursor && cursor.length > 0 ) {
		out.cursor = cursor;
	}
	return out;
}

/**
 * Authed page of accounts following `actor`. The wpcom backend extracts the
 * upstream `Link: rel="next"` header into `cursor`, batches the per-row
 * `viewer` relationship state, and skips the relationships call for the
 * caller's own row (returning `is_self: true` with an all-false `viewer`).
 */
export async function getMastodonActorFollowers(
	params: GetMastodonActorPageParams
): Promise< MastodonAccountSummariesPage > {
	const { connectionId, actor, cursor, limit } = params;
	try {
		return ( await wpcom.req.get(
			{
				// Encode `actor`; see getMastodonAuthorProfile for rationale.
				path: `/reader/mastodon/connections/${ connectionId }/profile/${ encodeURIComponent(
					actor
				) }/followers`,
				apiNamespace: NAMESPACE,
			},
			buildActorPageQuery( cursor, limit )
		) ) as MastodonAccountSummariesPage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

/**
 * Authed page of accounts `actor` follows. Same response shape and error
 * contract as `getMastodonActorFollowers`.
 */
export async function getMastodonActorFollowing(
	params: GetMastodonActorPageParams
): Promise< MastodonAccountSummariesPage > {
	const { connectionId, actor, cursor, limit } = params;
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/mastodon/connections/${ connectionId }/profile/${ encodeURIComponent(
					actor
				) }/following`,
				apiNamespace: NAMESPACE,
			},
			buildActorPageQuery( cursor, limit )
		) ) as MastodonAccountSummariesPage;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function createMastodonLike( params: MastodonCreateLikeParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			path: `/reader/mastodon/connections/${ params.connectionId }/likes`,
			apiNamespace: NAMESPACE,
			body: { status_id: params.statusId },
		} );
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function deleteMastodonLike( params: MastodonDeleteLikeParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			method: 'DELETE',
			// Encode the status id defensively — values are numeric strings
			// today, but a malformed `post.uri` flowing through (mapper bug,
			// whitespace, slashes) shouldn't smuggle path segments.
			path: `/reader/mastodon/connections/${ params.connectionId }/likes/${ encodeURIComponent(
				params.statusId
			) }`,
			apiNamespace: NAMESPACE,
		} );
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function createMastodonRepost( params: MastodonCreateRepostParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			path: `/reader/mastodon/connections/${ params.connectionId }/reposts`,
			apiNamespace: NAMESPACE,
			body: { status_id: params.statusId },
		} );
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function deleteMastodonRepost( params: MastodonDeleteRepostParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			method: 'DELETE',
			path: `/reader/mastodon/connections/${ params.connectionId }/reposts/${ encodeURIComponent(
				params.statusId
			) }`,
			apiNamespace: NAMESPACE,
		} );
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function createMastodonPost(
	params: MastodonCreatePostParams
): Promise< MastodonCreatePostResult > {
	const {
		connectionId,
		status,
		in_reply_to_id,
		quoted_status_id,
		media_ids,
		sensitive,
		visibility,
		spoiler_text,
	} = params;
	const body: Record< string, unknown > = { status };
	if ( in_reply_to_id ) {
		body.in_reply_to_id = in_reply_to_id;
	}
	if ( quoted_status_id ) {
		body.quoted_status_id = quoted_status_id;
	}
	if ( media_ids && media_ids.length > 0 ) {
		body.media_ids = media_ids;
	}
	if ( sensitive !== undefined ) {
		body.sensitive = sensitive;
	}
	if ( visibility !== undefined ) {
		body.visibility = visibility;
	}
	if ( spoiler_text !== undefined && spoiler_text.length > 0 ) {
		body.spoiler_text = spoiler_text;
	}
	try {
		return ( await wpcom.req.post( {
			path: `/reader/mastodon/connections/${ connectionId }/statuses`,
			apiNamespace: NAMESPACE,
			body,
		} ) ) as MastodonCreatePostResult;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function uploadMastodonMedia(
	params: MastodonMediaUploadParams
): Promise< MastodonMediaUploadResult > {
	const { connectionId, file, description } = params;
	// `wpcom-xhr-request` expects each formData value to be either a primitive
	// or a `{ fileContents, fileName }` envelope (it inspects `fileContents
	// instanceof Blob` to decide whether to call `req.attach` vs `req.field`).
	// Match the established pattern used by atmosphere's `uploadBlob` so the
	// transport produces a real multipart `file` part instead of a stringified
	// Blob field.
	const fileName = file instanceof File && file.name ? file.name : 'blob';
	const formData: Array<
		[ string, string ] | [ string, { fileContents: Blob; fileName: string } ]
	> = [ [ 'file', { fileContents: file, fileName } ] ];
	if ( description !== undefined ) {
		formData.push( [ 'description', description ] );
	}

	try {
		return ( await wpcom.req.post( {
			path: `/reader/mastodon/connections/${ connectionId }/media`,
			apiNamespace: NAMESPACE,
			formData,
		} ) ) as MastodonMediaUploadResult;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

// Cheap shape guard so a backend regression to `{}` or a `relationship`-shaped
// payload fails at the boundary instead of silently writing `viewer: undefined`
// into the cache during the optimistic-update commit. Throws a wpcom-shaped
// error so the outer `catch` classifier maps it consistently with wire errors.
function assertMastodonFollowResponse( raw: unknown ): asserts raw is MastodonFollowResponse {
	const reject = (): never => {
		// Distinct message so a backend-shape regression is grep-able in
		// Logstash / Sentry rather than indistinguishable from a real 400.
		// Real Error so dev-tools rejection logs show a usable stack.
		const err = new Error( 'invalid follow response shape' );
		Object.assign( err, { code: 'reader_mastodon_bad_request' } );
		throw err;
	};
	if ( typeof raw !== 'object' || raw === null ) {
		reject();
	}
	const viewer = ( raw as { viewer?: unknown } ).viewer;
	if (
		typeof viewer !== 'object' ||
		viewer === null ||
		typeof ( viewer as { following?: unknown } ).following !== 'boolean' ||
		typeof ( viewer as { followed_by?: unknown } ).followed_by !== 'boolean' ||
		typeof ( viewer as { requested?: unknown } ).requested !== 'boolean'
	) {
		reject();
	}
}

export async function createMastodonFollow(
	params: MastodonCreateFollowParams
): Promise< MastodonFollowResponse > {
	try {
		const raw = await wpcom.req.post( {
			path: `/reader/mastodon/connections/${ params.connectionId }/follows`,
			apiNamespace: NAMESPACE,
			body: { account_id: params.accountId },
		} );
		assertMastodonFollowResponse( raw );
		return raw;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}

export async function deleteMastodonFollow(
	params: MastodonDeleteFollowParams
): Promise< MastodonFollowResponse > {
	try {
		const raw = await wpcom.req.post( {
			method: 'DELETE',
			// Encode the account id defensively — values are numeric strings
			// today, but a malformed input shouldn't smuggle path segments.
			path: `/reader/mastodon/connections/${ params.connectionId }/follows/${ encodeURIComponent(
				params.accountId
			) }`,
			apiNamespace: NAMESPACE,
		} );
		assertMastodonFollowResponse( raw );
		return raw;
	} catch ( raw ) {
		throw classifyMastodonError( raw );
	}
}
