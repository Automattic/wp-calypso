export type FediverseError =
	| { kind: 'auth_failed' }
	| { kind: 'auth_required' }
	| { kind: 'forbidden' }
	| { kind: 'not_found' }
	| { kind: 'state_expired' }
	| { kind: 'note_empty' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'bad_request'; message: string }
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
		case 'state_expired':
			return { kind: 'state_expired' };
		case 'reader_activitypub_note_empty':
			return { kind: 'note_empty' };
		case 'ERR_AUTH_FAILED':
		case 'auth_failed':
			return { kind: 'auth_failed' };
		case 'ERR_AUTH_REQUIRED':
		case 'not_authenticated':
			return { kind: 'auth_required' };
		case 'ERR_RATE_LIMITED':
		case 'rate_limited':
			return rateLimited( raw );
		case 'ERR_UPSTREAM_UNAVAILABLE':
		case 'upstream_unavailable':
			return { kind: 'upstream_unavailable' };
	}
	const statusCode = raw.statusCode ?? raw.status;
	if ( statusCode === 400 && errorCode === 'state_expired' ) {
		return { kind: 'state_expired' };
	}
	if ( statusCode === 401 ) {
		return { kind: 'auth_required' };
	}
	if ( statusCode === 403 ) {
		return { kind: 'forbidden' };
	}
	if ( statusCode === 404 ) {
		return { kind: 'not_found' };
	}
	if ( statusCode === 429 ) {
		return rateLimited( raw );
	}
	if ( statusCode === 503 ) {
		return { kind: 'upstream_unavailable' };
	}
	return { kind: 'unknown', cause: raw };
}
