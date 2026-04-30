import { wpcom } from '../wpcom-fetcher';
import { classifyMastodonError } from './errors';
import type {
	MastodonAuthorFeedFilter,
	MastodonAuthorFeedPage,
	MastodonAuthorProfile,
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
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
