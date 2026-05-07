import { wpcom } from '../wpcom-fetcher';
import { classifyFediverseError } from './errors';
import type {
	FediverseAuthorFeedPage,
	FediverseAuthorProfile,
	FediverseAuthorProfileResponse,
	FediverseConnection,
	FediverseConnectionsResponse,
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
	const path = `/reader/fediverse/connections/${ connectionId }/timeline`;
	// eslint-disable-next-line no-console
	console.log( '[fediverse] GET', path, query );
	try {
		const response = ( await wpcom.req.get(
			{ path, apiNamespace: NAMESPACE },
			query
		) ) as FediverseTimelinePage;
		// eslint-disable-next-line no-console
		console.log( '[fediverse] GET', path, '→', response );
		return response;
	} catch ( raw ) {
		// eslint-disable-next-line no-console
		console.warn( '[fediverse] GET', path, '✗', raw );
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
	// eslint-disable-next-line no-console
	console.log( '[fediverse] GET', path );
	try {
		const response = ( await wpcom.req.get( {
			path,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseAuthorProfileResponse;
		// eslint-disable-next-line no-console
		console.log( '[fediverse] GET', path, '→', response );
		// Backend wraps the profile in a `profile` envelope so it can grow
		// side-band fields without breaking the shape; unwrap here so the
		// query layer keeps `FediverseAuthorProfile` as the public type.
		return response.profile;
	} catch ( raw ) {
		// eslint-disable-next-line no-console
		console.warn( '[fediverse] GET', path, '✗', raw );
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
	) }/feed`;
	// eslint-disable-next-line no-console
	console.log( '[fediverse] GET', path, query );
	try {
		const response = ( await wpcom.req.get(
			{ path, apiNamespace: NAMESPACE },
			query
		) ) as FediverseAuthorFeedPage;
		// eslint-disable-next-line no-console
		console.log( '[fediverse] GET', path, '→', response );
		return response;
	} catch ( raw ) {
		// eslint-disable-next-line no-console
		console.warn( '[fediverse] GET', path, '✗', raw );
		throw classifyFediverseError( raw );
	}
}
