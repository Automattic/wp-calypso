import { useEffect, useRef } from 'react';

export interface UseStreamKeyboardShortcutsOptions {
	/** When false, no shortcut fires (e.g. while the notifications panel is open). Defaults to true. */
	enabled?: boolean;
	/** `j` / `ArrowRight` — select the next post. */
	onNext: () => void;
	/** `k` / `ArrowLeft` — select the previous post. */
	onPrevious: () => void;
	/** `Enter` — open the selected post. */
	onOpen: () => void;
	/** `v` — open the selected post's original URL in a new tab. */
	onOpenInNewTab: () => void;
	/** `l` — like/unlike the selected post. */
	onToggleLike: () => void;
}

// Elements that keep their native key behaviour (typing, option selection).
const INTERACTIVE_TAGS = [ 'INPUT', 'SELECT', 'TEXTAREA' ];

/**
 * Registers the Reader stream's global reading shortcuts: `j`/`ArrowRight`
 * next, `k`/`ArrowLeft` previous, `Enter` open, `v` open in a new tab, and
 * `l` like/unlike. The shortcuts use the legacy stream's input/contentEditable
 * and ⌘/Ctrl guards, plus the full-post view's `.components-popover` filter and
 * an Alt guard; navigation/open keys call `preventDefault`.
 *
 * The listener is registered once (keyed only on `enabled`) and reads the latest
 * callbacks through a ref, so consumer callbacks that are recreated each render
 * (e.g. the like actions) neither churn the listener nor go stale.
 */
export function useStreamKeyboardShortcuts( {
	enabled = true,
	onNext,
	onPrevious,
	onOpen,
	onOpenInNewTab,
	onToggleLike,
}: UseStreamKeyboardShortcutsOptions ): void {
	const handlersRef = useRef( { onNext, onPrevious, onOpen, onOpenInNewTab, onToggleLike } );
	handlersRef.current = { onNext, onPrevious, onOpen, onOpenInNewTab, onToggleLike };

	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		const handleKeydown = ( event: KeyboardEvent ) => {
			const target = event.target as HTMLElement | null;

			if ( target && ( INTERACTIVE_TAGS.includes( target.tagName ) || target.isContentEditable ) ) {
				return;
			}

			// Leave shortcuts scoped to an open popover (e.g. a post kebab menu) alone.
			if ( target?.closest?.( '.components-popover' ) ) {
				return;
			}

			// Keep modifier combos (⌘K, Ctrl+K, browser shortcuts) untouched.
			if ( event.metaKey || event.ctrlKey || event.altKey ) {
				return;
			}

			const handlers = handlersRef.current;

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
				case 'Enter':
					event.preventDefault();
					handlers.onOpen();
					break;
				case 'v':
					handlers.onOpenInNewTab();
					break;
				case 'l':
					handlers.onToggleLike();
					break;
			}
		};

		// Capture phase mirrors the legacy stream: intercept before a descendant's
		// onKeyDown can swallow the key.
		document.addEventListener( 'keydown', handleKeydown, true );
		return () => document.removeEventListener( 'keydown', handleKeydown, true );
	}, [ enabled ] );
}
