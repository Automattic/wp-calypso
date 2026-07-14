import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parseErrorUrl } from '../utils/parse-error-url';
import type { NoticeAction, NoticeType } from '../store';

type AddNoticeFunc = ( content: string, type: NoticeType, actions?: NoticeAction[] ) => void;

/**
 * Maps a raw error message (after stripping the "Streaming error:" prefix) to a
 * user-friendly, sentence-case message for Feature Clip (video) generation failures.
 *
 * The wpcom streaming API surfaces error codes in the error message — e.g.
 * "network_error", "content_policy_violation", "quota_exceeded". We map the
 * most actionable ones to clear, non-technical language; everything else falls
 * back to a generic retry prompt so the user always gets a coherent message
 * rather than a raw code string.
 * @param rawMessage - The error message after stripping "Streaming error:" prefix
 * @returns A sentence-case, user-friendly error message
 */
export function getVideoGenerationErrorMessage( rawMessage: string ): string {
	const lower = rawMessage.toLowerCase();

	// Network / connectivity errors — JS fetch failures and wpcom network_error code
	if (
		lower.includes( 'network' ) ||
		lower.includes( 'failed to fetch' ) ||
		lower.includes( 'networkerror' ) ||
		lower.includes( 'internet connection' ) ||
		lower.includes( 'offline' )
	) {
		return __( 'Video generation failed. Check your connection and try again.', __i18n_text_domain__ );
	}

	// Content policy / safety filter rejections
	if (
		lower.includes( 'content_policy' ) ||
		lower.includes( 'content policy' ) ||
		lower.includes( 'safety' ) ||
		lower.includes( 'policy_violation' ) ||
		lower.includes( 'blocked' )
	) {
		return __(
			"Your prompt contains content that can't be generated. Try a different description.",
			__i18n_text_domain__
		);
	}

	// Server-side / service errors
	if (
		lower.includes( 'server_error' ) ||
		lower.includes( 'server error' ) ||
		lower.includes( 'service_unavailable' ) ||
		lower.includes( 'service unavailable' ) ||
		lower.includes( 'internal error' ) ||
		lower.includes( '500' ) ||
		lower.includes( '503' )
	) {
		return __( 'Something went wrong on our end. Please try again.', __i18n_text_domain__ );
	}

	// Validation / invalid input errors
	if (
		lower.includes( 'invalid_input' ) ||
		lower.includes( 'invalid input' ) ||
		lower.includes( 'validation' )
	) {
		return __( 'We couldn\'t process your request. Try rewording your prompt.', __i18n_text_domain__ );
	}

	// Generic fallback for any other video generation failure
	return __( 'Video generation failed. Please try again.', __i18n_text_domain__ );
}

interface UseErrorNoticeOptions {
	/**
	 * When true, maps the raw error message to a user-friendly sentence-case
	 * message for video generation failures instead of showing the raw text.
	 */
	isVideoMode?: boolean;
	/**
	 * Optional callback to retry the last generation. When provided, a
	 * "Try again" button is added inline to the error notice.
	 */
	onRetry?: () => void;
}

/**
 * Hook that displays an error notice when an error occurs.
 * Extracts URLs from error messages and shows appropriate action buttons.
 * Upgrade URLs show as persistent warning notices, other errors as snackbars.
 *
 * In video mode, maps raw API error codes to sentence-case user-friendly
 * messages and optionally adds a "Try again" inline action.
 * @param error     - The error to display
 * @param addNotice - Function to add a notice to the store
 * @param options   - Optional configuration for video mode and retry behaviour
 */
export function useErrorNotice(
	error: unknown,
	addNotice: AddNoticeFunc,
	options: UseErrorNoticeOptions = {}
): void {
	const { isVideoMode = false, onRetry } = options;

	useEffect( () => {
		if ( ! error ) {
			return;
		}

		const errorMessage =
			( error as Error )?.message ||
			String( error ) ||
			__( 'An error occurred while generating content.', __i18n_text_domain__ );

		const { content: parsedContent, url, isUpgradeUrl, isPlansPageUrl } = parseErrorUrl( errorMessage );

		if ( url && isUpgradeUrl ) {
			// Show upgrade notices as persistent warning notices
			addNotice( parsedContent, 'warning', [
				{
					label: isPlansPageUrl
						? __( 'See plans', __i18n_text_domain__ )
						: __( 'Upgrade plan', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
				},
			] );
		} else if ( url ) {
			// Non-upgrade URLs show as error snackbar with Learn more link
			addNotice( parsedContent, 'error', [
				{
					label: __( 'Learn more', __i18n_text_domain__ ),
					url,
					openInNewTab: true,
				},
			] );
		} else if ( isVideoMode ) {
			// In video mode, map the raw error code/message to a user-friendly
			// sentence-case message and include an inline "Try again" button.
			const friendlyMessage = getVideoGenerationErrorMessage( parsedContent );
			const actions: NoticeAction[] = onRetry
				? [ { label: __( 'Try again', __i18n_text_domain__ ), onClick: onRetry } ]
				: [];
			addNotice( friendlyMessage, 'error', actions.length ? actions : undefined );
		} else {
			// Plain errors show as snackbar
			addNotice( parsedContent, 'error' );
		}
	}, [ error, addNotice, isVideoMode, onRetry ] );
}
