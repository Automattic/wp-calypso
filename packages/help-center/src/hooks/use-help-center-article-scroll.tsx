import { useEffect } from '@wordpress/element';
import { debounce } from 'lodash';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
const cachedScrollPositions: Record< string, number > = {};

export const useHelpCenterArticleScroll = (
	postId: number | undefined,
	scrollParentRef: React.RefObject< HTMLElement >
) => {
	useEffect( () => {
		if ( ! postId || ! scrollParentRef?.current ) {
			return;
		}

		const scrollRef = scrollParentRef?.current;
		const scrollBehaviour = scrollRef.style.scrollBehavior;

		// temporary disable smooth scrolling
		scrollRef.style.scrollBehavior = 'auto';

		if ( cachedScrollPositions[ postId ] ) {
			scrollRef.scrollTop = cachedScrollPositions[ postId ];
		} else {
			scrollRef.scrollTop = 0;
		}

		// restore smooth scrolling
		scrollRef.style.scrollBehavior = scrollBehaviour;

		const handleScroll = debounce( ( event: { target: EventTarget | null } ) => {
			if ( event.target === scrollParentRef.current ) {
				cachedScrollPositions[ postId ] = Number( scrollRef.scrollTop );
			}
		}, 250 );

		scrollRef.addEventListener( 'scroll', handleScroll );

		return () => {
			scrollRef?.removeEventListener( 'scroll', handleScroll );
		};
	}, [ postId, scrollParentRef ] );
};
