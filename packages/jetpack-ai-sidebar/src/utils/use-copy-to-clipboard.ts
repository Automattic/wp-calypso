/**
 * Shared clipboard-copy state for review cards. Exposes whether the clipboard
 * API is available, which card currently shows "Copied", and a copy() that
 * flips that card to "Copied" for a couple of seconds. Used by both FeedbackList
 * (Generate Feedback / Proofreader) and review-mediation (AI Editorial Review).
 * @package
 */

/**
 * External dependencies
 */
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';

const COPY_RESET_MS = 2000;

export interface CopyToClipboard {
	/** True only where the clipboard API can actually service a write. */
	clipboardSupported: boolean;
	/** Key of the card currently showing "Copied", or null. */
	copiedKey: string | null;
	/** Copy `text` and mark `key` as copied for a couple of seconds. */
	copy: ( key: string, text: string ) => void;
}

/**
 * Clipboard-copy state hook.
 * @returns Clipboard support flag, the copied key, and a copy() action.
 */
export function useCopyToClipboard(): CopyToClipboard {
	const [ copiedKey, setCopiedKey ] = useState< string | null >( null );
	const resetTimer = useRef< ReturnType< typeof setTimeout > | undefined >( undefined );
	const mounted = useRef( true );

	// Only offer Copy where the clipboard API can actually service it, so an
	// advisory card never shows a Copy button that does nothing.
	const clipboardSupported = useMemo(
		() =>
			typeof ( globalThis.navigator as Navigator | undefined )?.clipboard?.writeText === 'function',
		[]
	);

	const copy = useCallback( ( key: string, text: string ) => {
		const clipboard = ( globalThis.navigator as Navigator | undefined )?.clipboard;
		if ( ! clipboard?.writeText ) {
			return;
		}
		clipboard
			.writeText( text )
			.then( () => {
				// The write may resolve after the card unmounts; don't touch state then.
				if ( ! mounted.current ) {
					return;
				}
				setCopiedKey( key );
				clearTimeout( resetTimer.current );
				resetTimer.current = setTimeout( () => setCopiedKey( null ), COPY_RESET_MS );
			} )
			.catch( () => {} );
	}, [] );

	useEffect( () => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			clearTimeout( resetTimer.current );
		};
	}, [] );

	return { clipboardSupported, copiedKey, copy };
}
