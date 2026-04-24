import { wpcom } from '../wpcom-fetcher';
import { classifyMastodonError } from './errors';
import type {
	MastodonConnectionDetails,
	MastodonConnectionsResponse,
	MastodonCreateConnectionResponse,
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

export interface CreateMastodonConnectionParams {
	instance: string;
	handle: string;
	access_token: string;
}

export async function createMastodonConnection(
	params: CreateMastodonConnectionParams
): Promise< MastodonCreateConnectionResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/mastodon/connections',
			apiNamespace: NAMESPACE,
			body: params,
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
