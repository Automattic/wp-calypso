import { useEffect, useRef } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Persist scroll position for Help Center articles.
 * Uses router location state which gets persisted to user preferences,
 * allowing scroll position to survive page refreshes.
 */
export const useHelpCenterArticleScroll = (
	postId: number | undefined,
	scrollParentRef: React.RefObject< HTMLElement >
) => {
	const location = useLocation();
	const navigate = useNavigate();
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		if ( ! postId || ! scrollParentRef?.current ) {
			return;
		}

		const scrollRef = scrollParentRef?.current;
		const scrollBehaviour = scrollRef.style.scrollBehavior;

		// temporary disable smooth scrolling
		scrollRef.style.scrollBehavior = 'auto';

		// Restore scroll from location state (persisted across refreshes) or default to 0
		const savedScrollTop = ( location.state as { scrollTop?: number } )?.scrollTop ?? 0;
		scrollRef.scrollTop = savedScrollTop;

		// Restore smooth scrolling
		scrollRef.style.scrollBehavior = scrollBehaviour;

		const handleScroll = () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}

			timeoutRef.current = setTimeout( () => {
				// Save scroll position to location state (which gets persisted via MemoryHistory)
				navigate( location.pathname + location.search + location.hash, {
					replace: true,
					state: { ...( location.state as object ), scrollTop: scrollRef.scrollTop },
				} );
			}, 2000 ); // Debounce to avoid excessive history updates
		};

		scrollRef.addEventListener( 'scroll', handleScroll );
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current ); // Clear the timeout during cleanup
			}
			scrollRef?.removeEventListener( 'scroll', handleScroll );
		};
	}, [ postId, scrollParentRef, location, navigate ] );
};
