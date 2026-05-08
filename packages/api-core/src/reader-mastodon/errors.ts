export type MastodonError =
	| { kind: 'invalid_instance' }
	| { kind: 'auth_failed' }
	| { kind: 'auth_required' }
	| { kind: 'connection_not_found' }
	| { kind: 'not_found' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'bad_request'; message: string }
	| { kind: 'media_too_large'; message?: string }
	| { kind: 'media_unsupported_type'; message?: string }
	| { kind: 'media_decode_failed'; message?: string }
	| { kind: 'media_invalid'; message?: string }
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

export function classifyMastodonError( raw: unknown ): MastodonError {
	if ( ! isWpErrorLike( raw ) ) {
		return { kind: 'unknown', cause: raw };
	}
	const rateLimited = ( source: WpErrorLike ): MastodonError => {
		const retryAfter = source.data?.retry_after;
		return typeof retryAfter === 'number'
			? { kind: 'rate_limited', retry_after: retryAfter }
			: { kind: 'rate_limited' };
	};
	// Slice 4 (timeline) backend used `mastodon_*` codes; slice 5 (thread)
	// backend uses `reader_mastodon_*`. Accept both so the classifier is
	// robust across endpoints regardless of which prefix lands on the wire.
	const errorCode = raw.error ?? raw.code;
	switch ( errorCode ) {
		case 'invalid_instance':
			return { kind: 'invalid_instance' };
		case 'auth_failed':
			return { kind: 'auth_failed' };
		case 'not_authenticated':
		case 'mastodon_auth_required':
		case 'reader_mastodon_unauthenticated':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'connection_not_found' };
		case 'mastodon_not_found':
		case 'reader_mastodon_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
		case 'mastodon_rate_limited':
		case 'reader_mastodon_rate_limited':
			return rateLimited( raw );
		case 'upstream_unavailable':
		case 'mastodon_upstream_unavailable':
		case 'reader_mastodon_upstream_unavailable':
			return { kind: 'upstream_unavailable' };
		case 'bad_request':
		case 'reader_mastodon_bad_request':
			return { kind: 'bad_request', message: raw.message ?? '' };
		case 'mastodon_media_too_large':
			return { kind: 'media_too_large', message: raw.message };
		case 'mastodon_media_unsupported_type':
			return { kind: 'media_unsupported_type', message: raw.message };
		case 'mastodon_media_decode_failed':
			return { kind: 'media_decode_failed', message: raw.message };
		case 'mastodon_media_invalid':
			return { kind: 'media_invalid', message: raw.message };
	}
	const statusCode = raw.statusCode ?? raw.status;
	if ( statusCode === 429 ) {
		return rateLimited( raw );
	}
	if ( statusCode === 401 ) {
		return { kind: 'auth_required' };
	}
	return { kind: 'unknown', cause: raw };
}
