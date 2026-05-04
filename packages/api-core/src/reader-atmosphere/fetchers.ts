import { wpcom } from '../wpcom-fetcher';
import { classifyAtmosphereError } from './errors';
import type {
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereCreateFollowResponse,
	AtmosphereScopedProfile,
	AtmosphereTagFeedPage,
	AtmosphereThreadResponse,
	AtmosphereTimelinePage,
	CreateLikeParams,
	CreateLikeResult,
	CreatePostParams,
	CreatePostResult,
	CreateRepostParams,
	CreateRepostResult,
	DeleteLikeParams,
	DeleteRepostParams,
} from './types';

const NAMESPACE = 'wpcom/v2';

export async function getConnections(): Promise< AtmosphereConnectionsResponse > {
	try {
		return ( await wpcom.req.get( {
			path: '/reader/atmosphere/connections',
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereConnectionsResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface CreateConnectionParams {
	handle: string;
	app_password: string;
}

export async function createConnection(
	params: CreateConnectionParams
): Promise< AtmosphereCreateConnectionResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/atmosphere/connections',
			apiNamespace: NAMESPACE,
			body: params,
		} ) ) as AtmosphereCreateConnectionResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function getConnection( id: number ): Promise< AtmosphereConnectionDetails > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/atmosphere/connections/${ id }`,
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereConnectionDetails;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetTimelineParams {
	connectionId: number;
	cursor?: string;
	limit?: number;
}

export async function getTimeline( params: GetTimelineParams ): Promise< AtmosphereTimelinePage > {
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
				path: `/reader/atmosphere/connections/${ connectionId }/timeline`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereTimelinePage;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetThreadParams {
	uri: string;
	depth?: number;
	parentHeight?: number;
}

export async function getThread( params: GetThreadParams ): Promise< AtmosphereThreadResponse > {
	const { uri, depth, parentHeight } = params;
	const query: Record< string, string > = { uri };
	// typeof guard preserves depth=0 (root only) and parentHeight=0 — valid backend values.
	if ( typeof depth === 'number' ) {
		query.depth = String( depth );
	}
	if ( typeof parentHeight === 'number' ) {
		query.parentHeight = String( parentHeight );
	}
	try {
		return ( await wpcom.req.get(
			{
				path: '/reader/atmosphere/thread',
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereThreadResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetAuthorProfileParams {
	actor: string;
}

export async function getAuthorProfile(
	params: GetAuthorProfileParams
): Promise< AtmosphereAuthorProfile > {
	const { actor } = params;
	try {
		return ( await wpcom.req.get( {
			path: `/reader/atmosphere/profile/${ encodeURIComponent( actor ) }`,
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereAuthorProfile;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetAuthorFeedParams {
	actor: string;
	cursor?: string;
	limit?: number;
	filter?: AtmosphereAuthorFeedFilter;
}

export async function getAuthorFeed(
	params: GetAuthorFeedParams
): Promise< AtmosphereAuthorFeedPage > {
	const { actor, cursor, limit, filter } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	if ( filter ) {
		query.filter = filter;
	}
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/atmosphere/profile/${ encodeURIComponent( actor ) }/feed`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereAuthorFeedPage;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetScopedProfileParams {
	connectionId: number;
	actor: string;
}

/**
 * Authed companion to `getAuthorProfile`. Adds the caller-relative
 * `viewer` subtree (see `AtmosphereProfileViewer`).
 */
export async function getScopedProfile(
	params: GetScopedProfileParams
): Promise< AtmosphereScopedProfile > {
	const { connectionId, actor } = params;
	try {
		return ( await wpcom.req.get( {
			path: `/reader/atmosphere/connections/${ connectionId }/profile/${ encodeURIComponent(
				actor
			) }`,
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereScopedProfile;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface CreateFollowParams {
	connectionId: number;
	subject_did: string;
}

/**
 * Creates an `app.bsky.graph.follow` record on the caller's PDS so the
 * connection identified by `connectionId` follows the actor identified
 * by `subject_did`. The rkey-rationale lives on `AtmosphereFollowRecord`.
 */
export async function createFollow(
	params: CreateFollowParams
): Promise< AtmosphereCreateFollowResponse > {
	const { connectionId, subject_did } = params;
	try {
		return ( await wpcom.req.post( {
			path: `/reader/atmosphere/connections/${ connectionId }/follows`,
			apiNamespace: NAMESPACE,
			body: { subject_did },
		} ) ) as AtmosphereCreateFollowResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface DeleteFollowParams {
	connectionId: number;
	rkey: string;
}

/**
 * Drops an `app.bsky.graph.follow` record from the caller's PDS. The
 * matching DELETE is dispatched as `wpcom.req.post({ method: 'DELETE' })`
 * because the wpcom client routes by `method`. The backend mirrors
 * upstream `deleteRecord` semantics for missing rkeys, but this wrapper
 * still classifies any non-2xx response as an `AtmosphereError`.
 */
export async function deleteFollow( params: DeleteFollowParams ): Promise< void > {
	const { connectionId, rkey } = params;
	try {
		await wpcom.req.post( {
			path: `/reader/atmosphere/connections/${ connectionId }/follows/${ encodeURIComponent(
				rkey
			) }`,
			apiNamespace: NAMESPACE,
			method: 'DELETE',
		} );
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function createLike( params: CreateLikeParams ): Promise< CreateLikeResult > {
	try {
		const res = ( await wpcom.req.post( {
			path: `/reader/atmosphere/connections/${ params.connectionId }/likes`,
			apiNamespace: NAMESPACE,
			body: {
				post_uri: params.postUri,
				post_cid: params.postCid,
			},
		} ) ) as { like: CreateLikeResult };
		return res.like;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function createPost( params: CreatePostParams ): Promise< CreatePostResult > {
	const { connectionId, text, reply, quote } = params;
	const body: Record< string, unknown > = { text };
	if ( reply ) {
		body.reply = reply;
	}
	if ( quote ) {
		body.quote = quote;
	}
	try {
		const response = ( await wpcom.req.post( {
			path: `/reader/atmosphere/connections/${ connectionId }/posts`,
			apiNamespace: NAMESPACE,
			body,
		} ) ) as { post: CreatePostResult };
		return response.post;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function deleteLike( params: DeleteLikeParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			method: 'DELETE',
			path: `/reader/atmosphere/connections/${ params.connectionId }/likes/${ params.rkey }`,
			apiNamespace: NAMESPACE,
		} );
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetAtmosphereTagFeedParams {
	connectionId: number;
	hashtag: string;
	cursor?: string;
	limit?: number;
}

export async function createRepost( params: CreateRepostParams ): Promise< CreateRepostResult > {
	try {
		const res = ( await wpcom.req.post( {
			path: `/reader/atmosphere/connections/${ params.connectionId }/reposts`,
			apiNamespace: NAMESPACE,
			body: {
				post_uri: params.postUri,
				post_cid: params.postCid,
			},
		} ) ) as { repost: CreateRepostResult };
		return res.repost;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function deleteRepost( params: DeleteRepostParams ): Promise< void > {
	try {
		await wpcom.req.post( {
			method: 'DELETE',
			path: `/reader/atmosphere/connections/${ params.connectionId }/reposts/${ params.rkey }`,
			apiNamespace: NAMESPACE,
		} );
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function getAtmosphereTagFeed(
	params: GetAtmosphereTagFeedParams
): Promise< AtmosphereTagFeedPage > {
	const { connectionId, hashtag, cursor, limit } = params;
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
				// Percent-encode the hashtag: HASHTAG_RE allows any Unicode
				// letter/number/mark, which must be encoded for the URL path.
				path: `/reader/atmosphere/connections/${ connectionId }/tag/${ encodeURIComponent(
					hashtag
				) }/feed`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereTagFeedPage;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}
