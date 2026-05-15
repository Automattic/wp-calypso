import { wpcom } from '../wpcom-fetcher';
import { classifyFediverseError } from './errors';
import type {
	FediverseAccountSummariesPage,
	FediverseAuthorFeedPage,
	FediverseAuthorProfile,
	FediverseAuthorProfileResponse,
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseCreateFollowParams,
	FediverseCreatePostParams,
	FediverseCreatePostResult,
	FediverseDeleteFollowParams,
	FediverseFollowResponse,
	FediverseTimelinePage,
} from './types';

const NAMESPACE = 'wpcom/v2';

/**
 * Lists the caller's Fediverse connections. Backend pre-mints Keyring
 * tokens for any owned ActivityPub-enabled blogs that don't have one
 * yet before returning, so the first call after enabling the feature
 * may be slower than subsequent ones.
 */
export async function getFediverseConnections(): Promise< FediverseConnectionsResponse > {
	try {
		return ( await wpcom.req.get( {
			path: '/reader/fediverse/connections',
			apiNamespace: NAMESPACE,
		} ) ) as FediverseConnectionsResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

/**
 * Fetches a single connection by its Keyring token id. Same wire shape
 * as the items returned from `getFediverseConnections` — the backend
 * has no separate "details" projection. Returns 404
 * `connection_not_found` when the id doesn't exist or isn't owned by
 * the caller.
 */
export async function getFediverseConnection( id: number ): Promise< FediverseConnection > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/fediverse/connections/${ id }`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseConnection;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface GetFediverseTimelineParams {
	connectionId: number;
	cursor?: string;
	limit?: number;
}

/**
 * Lists the home timeline for a Fediverse connection. Cursor-paginated
 * — pass the previous page's `cursor` in subsequent calls. Mirrors
 * `getMastodonTimeline`.
 */
export async function getFediverseTimeline(
	params: GetFediverseTimelineParams
): Promise< FediverseTimelinePage > {
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
				path: `/reader/fediverse/connections/${ connectionId }/timeline`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as FediverseTimelinePage;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface GetFediverseAuthorProfileParams {
	connectionId: number;
	actor: string;
}

/**
 * Fetches the AP actor profile for a webfinger-shaped or url-shaped
 * `actor`. Backend handles webfinger discovery and projects the actor
 * doc onto the Mastodon-compatible profile shape. Mirrors
 * `getMastodonAuthorProfile`.
 */
export async function getFediverseAuthorProfile(
	params: GetFediverseAuthorProfileParams
): Promise< FediverseAuthorProfile > {
	const { connectionId, actor } = params;
	// `actor` flows in from federated mention anchors and route segments;
	// encode so a crafted handle can't smuggle slashes or query separators
	// into the request path.
	const path = `/reader/fediverse/connections/${ connectionId }/profile/${ encodeURIComponent(
		actor
	) }`;
	try {
		const response = ( await wpcom.req.get( {
			path,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseAuthorProfileResponse;
		// Backend wraps the profile in a `profile` envelope so it can grow
		// side-band fields without breaking the shape; unwrap here so the
		// query layer keeps `FediverseAuthorProfile` as the public type.
		return response.profile;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface GetFediverseAuthorFeedParams {
	connectionId: number;
	actor: string;
	cursor?: string;
	limit?: number;
}

/**
 * Author feed: the actor's authored notes/articles, cursor-paginated.
 * Mirrors `getMastodonAuthorFeed` with no filter dimension for now —
 * the Fediverse backend slice doesn't expose `exclude_replies` /
 * `only_media` toggles yet. Add a `filter` param when those land.
 */
export async function getFediverseAuthorFeed(
	params: GetFediverseAuthorFeedParams
): Promise< FediverseAuthorFeedPage > {
	const { connectionId, actor, cursor, limit } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	const path = `/reader/fediverse/connections/${ connectionId }/profile/${ encodeURIComponent(
		actor
	) }/timeline`;
	try {
		return ( await wpcom.req.get(
			{ path, apiNamespace: NAMESPACE },
			query
		) ) as FediverseAuthorFeedPage;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface GetFediverseActorPageParams {
	connectionId: number;
	actor: string;
	cursor?: string;
	limit?: number;
}

/**
 * List the actor's followers (accounts who follow them), cursor-paginated.
 * Mirrors `getMastodonActorFollowers`.
 */
export async function getFediverseActorFollowers(
	params: GetFediverseActorPageParams
): Promise< FediverseAccountSummariesPage > {
	const { connectionId, actor, cursor, limit } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	const path = `/reader/fediverse/connections/${ connectionId }/profile/${ encodeURIComponent(
		actor
	) }/followers`;
	try {
		return ( await wpcom.req.get(
			{ path, apiNamespace: NAMESPACE },
			query
		) ) as FediverseAccountSummariesPage;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

/**
 * List the accounts the actor follows, cursor-paginated. Mirrors
 * `getMastodonActorFollowing`.
 */
export async function getFediverseActorFollowing(
	params: GetFediverseActorPageParams
): Promise< FediverseAccountSummariesPage > {
	const { connectionId, actor, cursor, limit } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	const path = `/reader/fediverse/connections/${ connectionId }/profile/${ encodeURIComponent(
		actor
	) }/following`;
	try {
		return ( await wpcom.req.get(
			{ path, apiNamespace: NAMESPACE },
			query
		) ) as FediverseAccountSummariesPage;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

/**
 * Follow an AP actor. Backend resolves the actor (webfinger or canonical
 * AP URL) and issues the upstream `Follow` activity. Returns the updated
 * viewer relationship — `requested: true` for locked accounts pending
 * approval, otherwise `following: true`. Mirrors `createMastodonFollow`.
 */
export async function createFediverseFollow(
	params: FediverseCreateFollowParams
): Promise< FediverseFollowResponse > {
	try {
		return ( await wpcom.req.post( {
			path: `/reader/fediverse/connections/${ params.connectionId }/follows`,
			apiNamespace: NAMESPACE,
			body: { actor: params.actor },
		} ) ) as FediverseFollowResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

/**
 * Unfollow an AP actor (also cancels a pending follow request for locked
 * accounts — one endpoint covers both). Mirrors `deleteMastodonFollow`.
 */
export async function deleteFediverseFollow(
	params: FediverseDeleteFollowParams
): Promise< FediverseFollowResponse > {
	try {
		return ( await wpcom.req.post( {
			method: 'DELETE',
			// `actor` flows in from federated mention anchors and account rows;
			// encode defensively so a crafted handle can't smuggle slashes or
			// query separators into the request path.
			path: `/reader/fediverse/connections/${ params.connectionId }/follows/${ encodeURIComponent(
				params.actor
			) }`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseFollowResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

/**
 * Publish a new ActivityPub post via the connected blog. Slice 2's
 * standalone composer entry point — reply / quote variants will extend
 * this fetcher (or sibling ones) in later slices. Forwards the
 * caller-supplied `idempotencyKey` as the `Idempotency-Key` request
 * header so a network retry can't double-post: the backend keys the
 * de-dupe table on this header.
 */
export async function createFediversePost(
	params: FediverseCreatePostParams
): Promise< FediverseCreatePostResult > {
	const { connectionId, content, visibility, summary, sensitive, language, idempotencyKey } =
		params;
	const body: Record< string, unknown > = { content, visibility };
	if ( summary !== undefined && summary.length > 0 ) {
		body.summary = summary;
	}
	if ( sensitive !== undefined ) {
		body.sensitive = sensitive;
	}
	if ( language !== undefined ) {
		body.language = language;
	}
	try {
		return ( await wpcom.req.post( {
			path: `/reader/fediverse/connections/${ connectionId }/posts`,
			apiNamespace: NAMESPACE,
			body,
			...( idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {} ),
		} ) ) as FediverseCreatePostResult;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}
