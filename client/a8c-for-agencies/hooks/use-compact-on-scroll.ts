import { useCallback, useEffect, useRef, useState } from 'react';

// Matches the banners' CSS `max-height` transition duration (0.25s).
const TRANSITION_DURATION_MS = 250;

/**
 * Toggles `isCompact` based on scroll direction inside a scrollable container.
 *
 * Wire `onScroll` onto a scrollable parent and pass `isCompact` to the
 * collapsible element. The CSS is responsible for the actual visual collapse.
 *
 * Note: the container must set `overflow-anchor: none` so the browser doesn't
 * drag `scrollTop` back to 0 when the banner collapses (the sticky header
 * above shrinks, and scroll anchoring would otherwise fight the animation).
 */
export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const isCompactRef = useRef( false );
	const lastScrollPosition = useRef( 0 );
	// While the banner is mid-collapse/expand, layout reflow can produce scroll
	// events whose values would flip the state back. Lock the state until the
	// CSS transition settles.
	const transitionTimeout = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		return () => {
			if ( transitionTimeout.current !== null ) {
				clearTimeout( transitionTimeout.current );
			}
		};
	}, [] );

	const onScroll = useCallback( ( event: React.UIEvent< HTMLDivElement > ) => {
		const scrollPosition = event.currentTarget.scrollTop;

		// Still track `lastScrollPosition` while the lockout is active so the
		// next genuine event compares against the post-transition position.
		// Without this, layout reflow inside the lockout (e.g. scroll anchoring
		// dragging scrollTop toward 0) would leave a stale baseline and cause
		// a spurious expand on the very next event.
		if ( transitionTimeout.current !== null ) {
			lastScrollPosition.current = scrollPosition;
			return;
		}

		const isScrollingDown = scrollPosition > lastScrollPosition.current;
		const prev = isCompactRef.current;

		let next = prev;
		if ( isScrollingDown && ! prev ) {
			next = true;
		} else if ( ! isScrollingDown && prev && scrollPosition === 0 ) {
			next = false;
		}

		lastScrollPosition.current = scrollPosition;

		if ( next === prev ) {
			return;
		}

		isCompactRef.current = next;
		setIsCompact( next );
		transitionTimeout.current = setTimeout( () => {
			transitionTimeout.current = null;
		}, TRANSITION_DURATION_MS );
	}, [] );

	return { onScroll, isCompact };
}
