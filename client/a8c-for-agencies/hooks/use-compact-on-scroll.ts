import { useCallback, useRef, useState } from 'react';

/**
 * Toggles `isCompact` based on scroll direction inside a scrollable container.
 *
 * Wire `onScroll` onto a scrollable parent and pass `isCompact` to the
 * collapsible element. The CSS is responsible for the actual visual collapse.
 */
export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const lastScrollPosition = useRef( 0 );

	const onScroll = useCallback( ( event: React.UIEvent< HTMLDivElement > ) => {
		const scrollPosition = event.currentTarget.scrollTop;
		const isScrollingDown = scrollPosition > lastScrollPosition.current;

		setIsCompact( ( prev ) => {
			if ( isScrollingDown && ! prev ) {
				return true;
			}
			if ( ! isScrollingDown && prev && scrollPosition === 0 ) {
				return false;
			}
			return prev;
		} );

		lastScrollPosition.current = scrollPosition;
	}, [] );

	return { onScroll, isCompact };
}
