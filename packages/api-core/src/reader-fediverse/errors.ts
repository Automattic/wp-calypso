/**
 * Narrow error union for the Reader Fediverse surface.
 *
 * Backend (CM-684) emits exactly two custom codes today:
 *   - `not_authenticated` (401) on the permission callback
 *   - `connection_not_found` (404) on `GET /connections/{id}`
 *
 * Generic transients (`rate_limited`, `upstream_unavailable`, `unknown`)
 * are carried for future slices when downstream calls hit federated
 * remotes — keeping them in the union now means the per-protocol UI
 * can render the same error vocabulary already used by the like /
 * repost adapters.
 *
 * Unknown wpcom error codes collapse to `{ kind: 'unknown', cause }`
 * rather than throwing or losing the original error object.
 */
export type FediverseError =
	| { kind: 'auth_required' }
	| { kind: 'connection_not_found' }
	| { kind: 'not_found' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'unknown'; cause: unknown };

interface WpErrorLike {
	error?: string;
	code?: string;
	statusCode?: number;
	status?: number;
	message?: string;
	data?: { retry_after?: number } & Record< string, unknown >;
}

function isWpErrorLike( e: unknown ): e is WpErrorLike {
	if ( typeof e !== 'object' || e === null ) {
		return false;
	}
	const obj = e as object;
	return 'error' in obj || 'code' in obj || 'statusCode' in obj || 'status' in obj;
}

export function classifyFediverseError( raw: unknown ): FediverseError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	const rateLimited = ( source: WpErrorLike ): FediverseError => {
		const retryAfter = source.data?.retry_after;
		return typeof retryAfter === 'number'
			? { kind: 'rate_limited', retry_after: retryAfter }
			: { kind: 'rate_limited' };
	};
	const errorCode = raw.error ?? raw.code;
	switch ( errorCode ) {
		case 'not_authenticated':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'connection_not_found' };
	}
	const status = raw.statusCode ?? raw.status;
	switch ( status ) {
		case 401:
			return { kind: 'auth_required' };
		case 404:
			return { kind: 'not_found' };
		case 429:
			return rateLimited( raw );
		case 502:
		case 503:
		case 504:
			return { kind: 'upstream_unavailable' };
	}
	return { kind: 'unknown', cause: raw };
}
