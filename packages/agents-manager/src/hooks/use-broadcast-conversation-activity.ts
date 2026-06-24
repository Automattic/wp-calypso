import { useEffect } from '@wordpress/element';

/**
 * Window event broadcast as the chat transcript grows. Code outside the React
 * tree (other bundles, external scripts) listens for it to re-sync state it
 * renders inside the transcript. See `hooks/custom-actions/README.md`.
 */
export const CONVERSATION_ACTIVITY_EVENT = 'agents-manager-conversation-changed';

/**
 * Broadcast conversation activity to code outside the React tree (other
 * bundles) so it can re-sync cards it renders in the transcript — e.g. Woo AI's
 * batch-operation card reflecting an execute/revert run from chat — without a
 * page reload. Keyed on transcript size so it fires as messages are appended (a
 * tool/agent message added mid-turn covers the execute/revert-from-chat case);
 * skipped while empty.
 * @param messageCount Number of messages currently shown in the transcript.
 */
export function useBroadcastConversationActivity( messageCount: number ): void {
	useEffect( () => {
		if ( messageCount === 0 ) {
			return;
		}
		window.dispatchEvent( new CustomEvent( CONVERSATION_ACTIVITY_EVENT ) );
	}, [ messageCount ] );
}
