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
	AtmosphereThreadResponse,
	AtmosphereTimelinePage,
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
 * Authed companion to `getAuthorProfile`. Returns the same profile
 * shape plus the caller-relative `viewer` block ({ following,
 * following_rkey, followed_by }) used to render the Follow / Follow
 * back / Following button on the Bluesky author profile page.
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
 * Creates an `app.bsky.graph.follow` record on the caller's PDS
 * (the connection identified by `connectionId` follows the actor
 * identified by `subject_did`). Returns the URI / CID / rkey of
 * the new record so callers can issue the matching DELETE without
 * splitting the AT-URI.
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
 * Drops an `app.bsky.graph.follow` record from the caller's PDS.
 * Idempotent: a missing rkey returns success (mirroring upstream
 * `deleteRecord` semantics).
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
