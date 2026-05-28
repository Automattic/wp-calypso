import { useCallback, useState } from 'react';

/**
 * Toggles `isCompact` based on scroll direction inside a scrollable container.
 *
 * Wire `onScroll` onto a scrollable parent and pass `isCompact` to the
 * collapsible element. The CSS is responsible for the actual visual collapse.
 */
export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const [ lastScrollPosition, setLastScrollPosition ] = useState( 0 );

	const onScroll = useCallback(
		( event: React.UIEvent< HTMLDivElement > ) => {
			const scrollPosition = event.currentTarget.scrollTop;
			const isScrollingDown = scrollPosition > lastScrollPosition;

			if ( isScrollingDown && ! isCompact ) {
				setIsCompact( true );
			} else if ( ! isScrollingDown && isCompact && scrollPosition === 0 ) {
				setIsCompact( false );
			}

			setLastScrollPosition( scrollPosition );
		},
		[ isCompact, lastScrollPosition ]
	);

	return { onScroll, isCompact };
}
