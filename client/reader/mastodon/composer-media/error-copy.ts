import type { ComposerImage } from './types';
import type { useTranslate } from 'i18n-calypso';

type Translate = ReturnType< typeof useTranslate >;

// Pre-flight rejection copy. Server-side errors (`media_too_large`,
// `media_unsupported_type`, `media_decode_failed`, `media_invalid`) surface
// through the composer-config `errorMessage` arms instead — they bubble up
// through the wire mutation, not the per-image grid.
export function getMediaErrorMessage(
	reason: Extract< ComposerImage, { kind: 'failed' } >[ 'reason' ],
	translate: Translate
): string {
	switch ( reason ) {
		case 'too_large':
			return translate( 'This image is over 8 MB. Choose a smaller file.' ) as string;
		case 'unsupported_type':
			return translate( "This format isn't supported. Try JPEG, PNG, GIF, or WebP." ) as string;
		default:
			reason satisfies never;
			return translate( "We couldn't read this image. Try a different file." ) as string;
	}
}
