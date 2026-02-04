import { useCallback, useRef, useState, useEffect } from 'react';

const SCROLL_THRESHOLD_PERCENTAGE = 0.2;
const SCROLL_THRESHOLD_NORMAL_BUFFER = 5;
const SCROLL_THRESHOLD_COMPACT_BUFFER = 15;

const TABS_GAP = 39;
const MINIMUM_COMPACT_HEIGHT = 74; // Header height

export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const [ lastScrollPosition, setLastScrollPosition ] = useState( 0 );
	const [ isTransitioning, setIsTransitioning ] = useState( false );

	const ref = useRef< HTMLDivElement >( null );

	const onTransitionEnd = useCallback( () => {
		setIsTransitioning( false );
		setLastScrollPosition( 0 );
		ref.current?.removeEventListener( 'transitionend', onTransitionEnd );
	}, [] );

	useEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		const contentElement = ref.current.querySelector( '.hosting-hero-section__content' );

		if ( ! contentElement ) {
			return;
		}

		const resizeObserver = new ResizeObserver( () => {
			if ( ref.current ) {
				const contentHeight = contentElement.getBoundingClientRect().height;
				// Recalculate the height of the section to match the content height
				ref.current.style.height = `${
					( contentHeight ? contentHeight + TABS_GAP : 0 ) + MINIMUM_COMPACT_HEIGHT
				}px`;
			}
		} );

		// Start observing the element
		return resizeObserver.observe( contentElement );
	}, [ ref ] );

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
