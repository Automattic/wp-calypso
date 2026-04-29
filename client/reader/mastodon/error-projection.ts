import type { MastodonError } from '@automattic/api-core';
import type { SocialError } from 'calypso/reader/social';

// Project a MastodonError onto the SocialError shape SocialFeedList consumes.
// Shared between TimelinePanel and the profile surface so both report
// identical error UX for identical upstream conditions.
export function projectMastodonError( err: MastodonError | null | undefined ): SocialError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
			return { kind: err.kind };
		case 'auth_failed':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'invalid_instance':
		case 'bad_request':
		case 'unknown':
			return { kind: 'unknown', cause: err };
		default:
			return assertNever( err );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled MastodonError kind: ${ JSON.stringify( value ) }` );
}
