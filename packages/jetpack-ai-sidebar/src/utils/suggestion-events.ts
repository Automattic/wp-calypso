export const SUGGESTION_ACTION_COMPLETE_EVENT = 'jetpack-ai-sidebar-suggestion-action-complete';

export function notifySuggestionActionComplete(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}

	window.dispatchEvent( new Event( SUGGESTION_ACTION_COMPLETE_EVENT ) );
}
