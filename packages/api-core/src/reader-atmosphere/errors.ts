export type AtmosphereError =
	| { kind: 'invalid_handle' }
	| { kind: 'invalid_credentials' }
	| { kind: 'auth_failed' }
	| { kind: 'auth_required' }
	| { kind: 'connection_not_found' }
	| { kind: 'not_found' }
	// retry_after is in seconds, matching the Bluesky and wpcom contract.
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'bad_request'; message: string | null }
	| { kind: 'unknown'; cause: unknown };

interface WpErrorLike {
	// The wpcom-proxy / wpcom-xhr-request transports surface the WP REST
	// envelope's error code as `code` on the thrown error. Some legacy
	// callsites (and the existing test fixtures) populate `error` instead.
	// Accept both so live errors classify correctly regardless of which
	// transport raised them.
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
	return 'error' in ( e as object ) || 'code' in ( e as object );
}

export function classifyAtmosphereError( raw: unknown ): AtmosphereError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	const errorCode = raw.error ?? raw.code;
	switch ( errorCode ) {
		case 'invalid_handle':
			return { kind: 'invalid_handle' };
		case 'invalid_credentials':
			return { kind: 'invalid_credentials' };
		case 'auth_failed':
			return { kind: 'auth_failed' };
		case 'atmosphere_auth_required':
		case 'atmosphere_unauthenticated':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'connection_not_found' };
		case 'atmosphere_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
			return { kind: 'rate_limited' };
		case 'atmosphere_rate_limited': {
			const retryAfter = raw.data?.retry_after;
			return typeof retryAfter === 'number'
				? { kind: 'rate_limited', retry_after: retryAfter }
				: { kind: 'rate_limited' };
		}
		case 'upstream_unavailable':
		case 'atmosphere_upstream_unavailable':
			return { kind: 'upstream_unavailable' };
		case 'bad_request':
		case 'atmosphere_bad_request':
			return { kind: 'bad_request', message: raw.message ?? null };
		default:
			return { kind: 'unknown', cause: raw };
	}
}
