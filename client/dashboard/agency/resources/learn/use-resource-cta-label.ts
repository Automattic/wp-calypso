import { __ } from '@wordpress/i18n';
import type { AgencyResourceFormat } from '@automattic/api-core';

/**
 * Custom hook to get the appropriate CTA label based on resource format
 * @param format - The format of the resource (e.g., 'video', 'pdf')
 * @returns Translated CTA label text
 */
export function useResourceCtaLabel( format: AgencyResourceFormat ): string {
	switch ( format ) {
		case 'video':
			return __( 'Watch now' );
		case 'pdf':
			return __( 'Download guide' );
		case 'slides':
			return __( 'View deck' );
		default:
			return __( 'Learn more' );
	}
}
