import { useTranslate } from 'i18n-calypso';

/**
 * Custom hook to get the appropriate CTA label based on resource format
 * @param format - The format of the resource (e.g., 'video', 'article')
 * @returns Translated CTA label text
 */
export function useResourceCtaLabel( format: string ): string {
	const translate = useTranslate();

	switch ( format ) {
		case 'Video':
			return translate( 'Watch now' );
		case 'PDF':
			return translate( 'Download Guide' );
		case 'Slide Deck':
			return translate( 'View Deck' );
		default:
			return translate( 'Read more' );
	}
}
