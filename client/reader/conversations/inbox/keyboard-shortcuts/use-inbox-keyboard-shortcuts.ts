import { useEffect, useRef } from 'react';
import type { InboxTab } from '../conversation-list/tabs';

interface Options {
	/** When false, no shortcut fires (e.g. while the notifications panel is open). Defaults to true. */
	enabled?: boolean;
	/** `ArrowDown` / `j` — open the next conversation. */
	onNext: () => void;
	/** `ArrowUp` / `k` — open the previous conversation. */
	onPrevious: () => void;
	/** `ArrowRight` — switch to the next tab. */
	onNextTab: () => void;
	/** `ArrowLeft` — switch to the previous tab. */
	onPreviousTab: () => void;
	/** `a` / `u` / `c` — switch to the All, Unread or Your comments tab. */
	onSelectTab: ( tab: InboxTab ) => void;
	/** `i` — open or close the shortcuts popover. */
	onToggleShortcuts: () => void;
}

const INTERACTIVE_TAGS = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

const POPOVER_SELECTOR = '.components-popover, .popover';

export const SHORTCUTS_POPOVER_CLASS = 'conversations-inbox__shortcuts-popover';

const TAB_KEYS: Record< string, InboxTab > = {
	a: 'all',
	u: 'unread',
	c: 'yours',
};

/**
 * Registers the Conversations inbox shortcuts, with the same input and modifier
 * guards as `useStreamKeyboardShortcuts`. Keys pressed inside any popover are
 * ignored, except `i` inside the shortcuts popover so it can close itself.
 */
export function useInboxKeyboardShortcuts( {
	enabled = true,
	onNext,
	onPrevious,
	onNextTab,
	onPreviousTab,
	onSelectTab,
	onToggleShortcuts,
}: Options ): void {
	const handlersRef = useRef( {
		onNext,
		onPrevious,
		onNextTab,
		onPreviousTab,
		onSelectTab,
		onToggleShortcuts,
	} );
	handlersRef.current = {
		onNext,
		onPrevious,
		onNextTab,
		onPreviousTab,
		onSelectTab,
		onToggleShortcuts,
	};

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

			// Leave keys inside other popovers alone (WordPress and legacy `ReaderPopover`
			// menus), but let `i` close the shortcuts popover while focus is inside it.
			const popover = target?.closest?.( POPOVER_SELECTOR );
			if ( popover ) {
				if ( event.key === 'i' && popover.classList.contains( SHORTCUTS_POPOVER_CLASS ) ) {
					handlers.onToggleShortcuts();
				}
				return;
			}

			if ( event.key === 'i' ) {
				handlers.onToggleShortcuts();
				return;
			}

			switch ( event.key ) {
				case 'ArrowDown':
				case 'j':
					event.preventDefault();
					handlers.onNext();
					break;
				case 'ArrowUp':
				case 'k':
					event.preventDefault();
					handlers.onPrevious();
					break;
				case 'ArrowRight':
					event.preventDefault();
					handlers.onNextTab();
					break;
				case 'ArrowLeft':
					event.preventDefault();
					handlers.onPreviousTab();
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
