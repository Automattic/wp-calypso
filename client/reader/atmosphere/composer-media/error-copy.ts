import type { AtmosphereError } from '@automattic/api-core';
import type { useTranslate } from 'i18n-calypso';

/**
 * Localized copy for media-related error kinds surfaced inline on a
 * thumbnail. The composer-modal-level error region renders its own copy
 * via a separate switch.
 */
export function getMediaErrorMessage(
	err: AtmosphereError,
	t: ReturnType< typeof useTranslate >
): string {
	switch ( err.kind ) {
		case 'blob_decode_failed':
			// Set client-side when `compressImage` throws (canvas decode /
			// re-encode failure). The slice-8a backend collapses every
			// /blobs rejection (oversize, MIME, undecodable) into the
			// generic `bad_request` kind handled by `default` below.
			return t( 'We couldn’t read this image. Try a different file.' ) as string;
		case 'rate_limited':
			return t( 'You’re posting too quickly. Try again in a moment.' ) as string;
		case 'upstream_unavailable':
			return t( 'Bluesky is taking longer than usual. Please try again.' ) as string;
		default:
			return t( 'Something went wrong. Please try again.' ) as string;
	}
}
