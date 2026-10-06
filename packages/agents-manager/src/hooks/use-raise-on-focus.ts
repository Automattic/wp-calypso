import { useEffect } from '@wordpress/element';

const FOCUSED_ATTRIBUTE = 'data-overlay-panel-focused';

function raise( node: HTMLElement ) {
	if ( node.hasAttribute( FOCUSED_ATTRIBUTE ) ) {
		return;
	}

	document.querySelector( `[${ FOCUSED_ATTRIBUTE }]` )?.removeAttribute( FOCUSED_ATTRIBUTE );
	node.setAttribute( FOCUSED_ATTRIBUTE, '' );
}

/**
 * Keeps the overlay panel the user touched last on top, as the floating chat
 * and the Help Center can overlap. A panel is focused when it opens, and on
 * `pointerdown` or `focusin` inside it, until another panel is. The DOM holds
 * the mark because the panels ship in separate bundles, as a data attribute
 * because React rewrites `className`.
 */
export default function useRaiseOnFocus( node: HTMLElement | null, isOpen = true ): void {
	useEffect( () => {
		if ( ! node ) {
			return;
		}

		const handleFocus = () => raise( node );

		// Capture, so a `stopPropagation()` inside the panel can't swallow the event.
		node.addEventListener( 'pointerdown', handleFocus, true );
		node.addEventListener( 'focusin', handleFocus, true );

		return () => {
			node.removeEventListener( 'pointerdown', handleFocus, true );
			node.removeEventListener( 'focusin', handleFocus, true );
			node.removeAttribute( FOCUSED_ATTRIBUTE );
		};
	}, [ node ] );

	useEffect( () => {
		if ( node && isOpen ) {
			raise( node );
		}
	}, [ node, isOpen ] );
}
