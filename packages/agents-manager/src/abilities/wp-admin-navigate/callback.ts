import { __, sprintf } from '@wordpress/i18n';
import { getActiveSessionId } from '../../utils/agent-session';
import {
	getPendingNavigation,
	isContinuationSent,
	NAVIGATION_PENDING_EVENT,
	savePendingNavigation,
} from '../../utils/wp-admin-navigation-state';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

// Lets the turn's stream close before the page unloads — that is what
// persists the parked call for the destination page to answer.
const NAVIGATE_DELAY_MS = 1000;

interface WpAdminNavigateInput {
	path?: string;
	// Injected by the tool executor alongside the model's arguments.
	toolCallId?: string;
	toolId?: string;
}

/**
 * The `wp-admin-navigate` ability callback: saves the resume state and sends
 * the browser to another wp-admin page. `returnToAgent` stays `false` — the
 * turn continues on the destination page, where `useNavigationContinuation`
 * sends a continuation tool result for this call.
 */
export async function wpAdminNavigateCallback(
	input: WpAdminNavigateInput
): Promise< AbilityResult > {
	const { path, toolCallId, toolId } = input;

	// Normalized before validating, so dot segments cannot escape wp-admin.
	let destinationUrl: URL;
	try {
		destinationUrl = new URL( path ?? '', window.location.origin );
	} catch {
		return errorResult( 'The `path` is not a valid wp-admin path.' );
	}
	if (
		destinationUrl.origin !== window.location.origin ||
		! destinationUrl.pathname.startsWith( '/wp-admin/' ) ||
		// Encoded separators survive URL normalization, but servers that decode
		// before normalizing would resolve them outside wp-admin.
		/%2f|%5c/i.test( destinationUrl.pathname )
	) {
		return errorResult(
			'The `path` must be a same-origin path starting with `/wp-admin/`, with no encoded separators.'
		);
	}
	// The hash is dropped: a hash-only difference would not reload the page.
	const destination = destinationUrl.pathname + destinationUrl.search;

	const sessionId = getActiveSessionId();

	// Saved right away, so the call stays answerable even if the user leaves
	// the page during the delay — the landing page then reports where they
	// went. The hook's own guards keep the origin page from answering early.
	// Without the state no page could ever answer, so a failed save refuses
	// the navigation instead of stranding the call.
	if ( ! savePendingNavigation( destination, sessionId, toolCallId, toolId ) ) {
		return errorResult( 'Failed to store the navigation resume state.' );
	}

	setTimeout( () => {
		// Answered or cleared during the delay — a message sent before the
		// redirect flushes the parked call as a decline, and navigating now
		// would abandon the conversation that answer just continued.
		const pending = getPendingNavigation();
		if ( ! pending || isContinuationSent( pending ) ) {
			return;
		}

		// Re-announced at redirect time: re-arms the hook's `beforeunload`
		// probe — its proof of a dismissed dialog — in case an earlier
		// navigation attempt consumed the once-listener during the delay.
		window.dispatchEvent( new Event( NAVIGATION_PENDING_EVENT ) );

		// A same-page destination must still reload — assigning an identical
		// URL would be a no-op and the parked call would read as a decline.
		if ( destination === window.location.pathname + window.location.search ) {
			window.location.reload();
		} else {
			window.location.href = destination;
		}
	}, NAVIGATE_DELAY_MS );

	return successResult(
		/* translators: %s: the wp-admin path being opened. */
		sprintf( __( 'Taking you to %s…', __i18n_text_domain__ ), destination ),
		undefined,
		{ returnToAgent: false }
	);
}
