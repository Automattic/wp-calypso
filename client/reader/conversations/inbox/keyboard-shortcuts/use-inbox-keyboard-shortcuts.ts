import { useEffect, useRef } from 'react';
import type { InboxTab } from '../conversation-list/tabs';

interface Options {
	/** When false, no shortcut fires (e.g. while the notifications panel is open). Defaults to true. */
	enabled?: boolean;
	/** `j` / `ArrowRight` — open the next conversation. */
	onNext: () => void;
	/** `k` / `ArrowLeft` — open the previous conversation. */
	onPrevious: () => void;
	/** `a` / `u` / `c` — switch to the All, Unread or Your comments tab. */
	onSelectTab: ( tab: InboxTab ) => void;
	/** `i` — open or close the shortcuts popover. */
	onToggleShortcuts: () => void;
}

const INTERACTIVE_TAGS = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

const TAB_KEYS: Record< string, InboxTab > = {
	a: 'all',
	u: 'unread',
	c: 'yours',
};

/**
 * Registers the Conversations inbox shortcuts, with the same input, popover and
 * modifier guards as `useStreamKeyboardShortcuts`. `i` is checked before the
 * popover guard so it also closes the shortcuts popover while focus is inside it.
 */
export function useInboxKeyboardShortcuts( {
	enabled = true,
	onNext,
	onPrevious,
	onSelectTab,
	onToggleShortcuts,
}: Options ): void {
	const handlersRef = useRef( { onNext, onPrevious, onSelectTab, onToggleShortcuts } );
	handlersRef.current = { onNext, onPrevious, onSelectTab, onToggleShortcuts };

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		const handleKeydown = ( event: KeyboardEvent ) => {
			const target = event.target as HTMLElement | null;

			if ( target && ( INTERACTIVE_TAGS.includes( target.tagName ) || target.isContentEditable ) ) {
				return;
			}

			if ( event.metaKey || event.ctrlKey || event.altKey ) {
				return;
			}

			const handlers = handlersRef.current;

			if ( event.key === 'i' ) {
				handlers.onToggleShortcuts();
				return;
			}

			if ( target?.closest?.( '.components-popover' ) ) {
				return;
			}

			switch ( event.key ) {
				case 'j':
				case 'ArrowRight':
					event.preventDefault();
					handlers.onNext();
					break;
				case 'k':
				case 'ArrowLeft':
					event.preventDefault();
					handlers.onPrevious();
					break;
				default:
					if ( TAB_KEYS[ event.key ] ) {
						handlers.onSelectTab( TAB_KEYS[ event.key ] );
					}
			}
		};

		document.addEventListener( 'keydown', handleKeydown, true );
		return () => document.removeEventListener( 'keydown', handleKeydown, true );
	}, [ enabled ] );
}
