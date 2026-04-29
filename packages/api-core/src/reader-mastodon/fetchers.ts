import { wpcom } from '../wpcom-fetcher';
import { classifyMastodonError } from './errors';
import type {
	MastodonAuthorizeResponse,
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
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
