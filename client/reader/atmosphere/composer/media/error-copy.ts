import type { AtmosphereError } from '@automattic/api-core';
import type { useTranslate } from 'i18n-calypso';

/**
 * Localized copy for media-related error kinds surfaced inline on a
 * thumbnail. The composer-modal-level error region (Task 15) will share
 * `media_invalid` and `unknown` cases via its own switch.
 */
export function getMediaErrorMessage(
	err: AtmosphereError,
	t: ReturnType< typeof useTranslate >
): string {
	switch ( err.kind ) {
		case 'blob_too_large':
			return t( 'Image is too large.' ) as string;
		case 'blob_unsupported_type':
			return t( 'We can only post JPG, PNG, or WebP images.' ) as string;
		case 'blob_decode_failed':
			return t( 'We couldn’t read this image. Try a different file.' ) as string;
		case 'rate_limited':
			return t( 'You’re posting too quickly. Try again in a moment.' ) as string;
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' ) as string;
		default:
			return t( 'Something went wrong. Please try again.' ) as string;
	}
}
