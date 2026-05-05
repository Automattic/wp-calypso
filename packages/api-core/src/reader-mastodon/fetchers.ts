import { wpcom } from '../wpcom-fetcher';
import { classifyMastodonError } from './errors';
import type {
	MastodonCreateLikeParams,
	MastodonDeleteLikeParams,
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
	MastodonCreateRepostParams,
	MastodonDeleteRepostParams,
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
