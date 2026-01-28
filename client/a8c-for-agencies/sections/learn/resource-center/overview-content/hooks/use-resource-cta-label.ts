import { __ } from '@wordpress/i18n';

/**
 * Custom hook to get the appropriate CTA label based on resource format
 * @param format - The format of the resource (e.g., 'video', 'article')
 * @returns Translated CTA label text
 */
export function useResourceCtaLabel( format: string ): string {
	switch ( format ) {
		case 'Video':
			return __( 'Watch now' );
		case 'PDF':
			return __( 'Download guide' );
		case 'Slide Deck':
			return __( 'View deck' );
		default:
			return __( 'Learn more' );
	}
}
