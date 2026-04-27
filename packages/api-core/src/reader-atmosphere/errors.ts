export type AtmosphereError =
	| { kind: 'invalid_handle' }
	| { kind: 'invalid_credentials' }
	| { kind: 'auth_failed' }
	| { kind: 'connection_not_found' }
	| { kind: 'rate_limited' }
	| { kind: 'upstream_unavailable' }
	| { kind: 'bad_request'; message: string }
	| { kind: 'unknown'; cause: unknown };

interface WpErrorLike {
	error?: string;
	statusCode?: number;
	status?: number;
	message?: string;
}

function isWpErrorLike( e: unknown ): e is WpErrorLike {
	return typeof e === 'object' && e !== null && 'error' in ( e as object );
}

export function classifyAtmosphereError( raw: unknown ): AtmosphereError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	switch ( raw.error ) {
		case 'invalid_handle':
			return { kind: 'invalid_handle' };
		case 'invalid_credentials':
			return { kind: 'invalid_credentials' };
		case 'auth_failed':
			return { kind: 'auth_failed' };
		case 'connection_not_found':
			return { kind: 'connection_not_found' };
		case 'rate_limited':
			return { kind: 'rate_limited' };
		case 'upstream_unavailable':
			return { kind: 'upstream_unavailable' };
		case 'bad_request':
			return { kind: 'bad_request', message: raw.message ?? '' };
		default:
			return { kind: 'unknown', cause: raw };
	}
}
