export type MastodonError =
	| { kind: 'invalid_instance' }
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

export function classifyMastodonError( raw: unknown ): MastodonError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	switch ( raw.error ) {
		case 'invalid_instance':
			return { kind: 'invalid_instance' };
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
