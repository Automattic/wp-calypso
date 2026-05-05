/**
 * Maps server-side WP_Error codes returned by AI tool abilities to
 * user-facing notice content. The server already emits structured errors
 * (via WP_Error → REST JSON `{ code, message, data }`); this is the single
 * source of truth for how each code surfaces in the UI.
 *
 * Codes not listed here fall through to a generic notice so we never
 * silently swallow a failure.
 */
import { __ } from '@wordpress/i18n';
import type { TrackedErrorType } from './tracking';

export interface ToolErrorCategory {
	/** User-facing copy. Template-only — must NOT contain user input. */
	userMessage: string;
	/** Notice severity. */
	severity: 'error' | 'warning';
	/** Tracks event errorType so we can measure category frequency. */
	errorType: TrackedErrorType;
}

/**
 * Codes from `cancelled` and validation-only errors are intentionally omitted
 * (cancelled is user-initiated; validation errors mean the agent sent bad
 * args, which is a code bug we don't want to surface as user-facing).
 */
export function getToolErrorCategory( code: string ): ToolErrorCategory | null {
	switch ( code ) {
		case 'rai_filtered':
			return {
				userMessage: __(
					'This prompt was blocked by safety filters. Try editing the post or picking a different style.',
					__i18n_text_domain__
				),
				severity: 'warning',
				errorType: 'safety_filter',
			};

		case 'ip_filtered':
			return {
				userMessage: __(
					'Your prompt referenced a copyrighted property (movie, brand, or character). Try rephrasing without the reference.',
					__i18n_text_domain__
				),
				severity: 'warning',
				errorType: 'copyright_filter',
			};

		case 'video_upload_not_supported':
			return {
				userMessage: __(
					'This site does not support video uploads. A plan with video upload capability is required.',
					__i18n_text_domain__
				),
				severity: 'warning',
				errorType: 'unsupported_capability',
			};

		case 'video_utils_not_implemented':
		case 'auth_failed':
			return {
				userMessage: __(
					"Video generation isn't ready on this site. Please contact your site admin.",
					__i18n_text_domain__
				),
				severity: 'error',
				errorType: 'not_configured',
			};

		case 'polling_timeout':
			return {
				userMessage: __(
					'Video generation took longer than expected. Please try again in a moment.',
					__i18n_text_domain__
				),
				severity: 'warning',
				errorType: 'timeout',
			};

		case 'operation_error':
		case 'read_failed':
		case 'invalid_tmp_path':
		case 'upload_failed':
			return {
				userMessage: __(
					"Video generation didn't complete. Please try again.",
					__i18n_text_domain__
				),
				severity: 'error',
				errorType: 'generation_failed',
			};

		default:
			return null;
	}
}

/**
 * Best-effort detection of a WP_Error-shaped value emitted by the
 * abilities REST controller. WordPress serialises WP_Error as
 * `{ code, message, data? }`.
 */
export function isWpErrorShape(
	value: unknown
): value is { code: string; message: string; data?: unknown } {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}
	const candidate = value as { code?: unknown; message?: unknown };
	return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
