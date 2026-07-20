/**
 * External dependencies
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize rich text for display in the review UI.
 *
 * The built-in HTML profile preserves HTML formatting without admitting SVG
 * or MathML stylesheet carriers. Apply paths continue to use the raw value.
 * @param html Rich-text HTML fragment.
 * @returns Sanitized HTML for preview rendering.
 */
export function sanitizeReviewRichText( html: string ): string {
	return DOMPurify.sanitize( html, { USE_PROFILES: { html: true } } );
}
