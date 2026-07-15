import { useEffect, useRef } from '@wordpress/element';

/**
 * Detail payload carried by {@link CHAT_VISIBILITY_EVENT}.
 */
export interface ChatVisibilityEventDetail {
	isVisible: boolean;
}

/**
 * Window event fired on chat open/close, for entry points in other bundles to
 * reflect the state. The new value rides in `event.detail.isVisible`; listeners
 * must not re-read `isChatVisible()`, which is refreshed a beat later and still
 * holds the previous value at dispatch time. See `hooks/custom-actions/README.md`.
 */
export const CHAT_VISIBILITY_EVENT = 'agents-manager-chat-visibility-changed';

/**
 * Broadcast chat visibility changes to code outside the React tree. Only real
 * transitions fire: the previous-value guard skips the initial value and any
 * no-op re-run (e.g. React StrictMode's mount/remount).
 * @param isVisible Whether the chat is currently visible (open and not minimized).
 */
export function useBroadcastChatVisibility( isVisible: boolean ): void {
	const previousIsVisible = useRef( isVisible );

	useEffect( () => {
		if ( previousIsVisible.current === isVisible ) {
			return;
		}
		previousIsVisible.current = isVisible;
		window.dispatchEvent(
			new CustomEvent< ChatVisibilityEventDetail >( CHAT_VISIBILITY_EVENT, {
				detail: { isVisible },
			} )
		);
	}, [ isVisible ] );
}
