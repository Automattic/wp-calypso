import { wpcom } from '../wpcom-fetcher';
import { classifyFediverseError } from './errors';
import type { FediverseConnection, FediverseConnectionsResponse } from './types';

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
