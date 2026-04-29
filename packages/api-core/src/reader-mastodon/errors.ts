export type MastodonError =
	| { kind: 'invalid_instance' }
	| { kind: 'auth_failed' }
	| { kind: 'auth_required' }
	| { kind: 'connection_not_found' }
	| { kind: 'not_found' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'bad_request'; message: string }
	| { kind: 'unknown'; cause: unknown };

interface WpErrorLike {
	error?: string;
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
	return 'error' in obj || 'statusCode' in obj || 'status' in obj;
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
	switch ( raw.error ) {
		case 'invalid_instance':
			return { kind: 'invalid_instance' };
		case 'auth_failed':
			return { kind: 'auth_failed' };
		case 'mastodon_auth_required':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'connection_not_found' };
		case 'mastodon_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
		case 'mastodon_rate_limited':
			return rateLimited( raw );
		case 'upstream_unavailable':
		case 'mastodon_upstream_unavailable':
			return { kind: 'upstream_unavailable' };
		case 'bad_request':
			return { kind: 'bad_request', message: raw.message ?? '' };
	}
	const statusCode = raw.statusCode ?? raw.status;
	if ( statusCode === 429 ) {
		return rateLimited( raw );
	}
	return { kind: 'unknown', cause: raw };
}
