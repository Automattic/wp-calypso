export type MastodonError =
	| { kind: 'invalid_instance' }
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
	if ( typeof e !== 'object' || e === null ) {
		return false;
	}
	const obj = e as object;
	return 'error' in obj || 'statusCode' in obj || 'status' in obj;
}

export function classifyMastodonError( raw: unknown ): MastodonError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	switch ( raw.error ) {
		case 'invalid_instance':
			return { kind: 'invalid_instance' };
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
	}
	// Fall-through: no body-level error code matched. HTTP 429 without a
	// body-coded error still means rate limiting — surface the right copy
	// instead of collapsing to a generic "unknown".
	const statusCode = raw.statusCode ?? raw.status;
	if ( statusCode === 429 ) {
		return { kind: 'rate_limited' };
	}
	return { kind: 'unknown', cause: raw };
}
