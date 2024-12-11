import { useCallback, useRef, useState } from 'react';

const SCROLL_THRESHOLD_PERCENTAGE = 0.2;
const SCROLL_THRESHOLD_NORMAL_BUFFER = 5;
const SCROLL_THRESHOLD_COMPACT_BUFFER = 15;

export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const [ lastScrollPosition, setLastScrollPosition ] = useState( 0 );
	const [ isTransitioning, setIsTransitioning ] = useState( false );

	const ref = useRef< HTMLDivElement >( null );

	const onTransitionEnd = useCallback( () => {
		setIsTransitioning( false );
		ref.current?.removeEventListener( 'transitionend', onTransitionEnd );
	}, [] );

	const onScroll = useCallback(
		( event: React.UIEvent< HTMLDivElement > ) => {
			if ( isTransitioning ) {
				return;
			}

			const scrollPosition = event.currentTarget.scrollTop;
			const isScrollingDown = scrollPosition > lastScrollPosition;

			const normalHeight = ref.current?.clientHeight ?? 0;

			const normalScrollThreshold = normalHeight * SCROLL_THRESHOLD_PERCENTAGE;

			if (
				isScrollingDown &&
				! isCompact &&
				scrollPosition > normalScrollThreshold + SCROLL_THRESHOLD_NORMAL_BUFFER
			) {
				setIsCompact( true );
				setIsTransitioning( true );
				ref.current?.addEventListener( 'transitionend', onTransitionEnd );
			} else if (
				! isScrollingDown &&
				isCompact &&
				scrollPosition < normalScrollThreshold - SCROLL_THRESHOLD_COMPACT_BUFFER
			) {
				setIsCompact( false );
				setIsTransitioning( true );
				ref.current?.addEventListener( 'transitionend', onTransitionEnd );
			}

			setLastScrollPosition( scrollPosition );
		},
		[ isCompact, isTransitioning, lastScrollPosition, onTransitionEnd ]
	);

	return {
		onScroll,
		isCompact,
		ref,
	};
}
