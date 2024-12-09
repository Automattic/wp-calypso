import { useEffect, useState } from '@wordpress/element';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
let cachedScrollPosition = 0;

/**
 * Persists the scroll position of an element in memory and returns it.
 * @param ref the HTML element to track the scroll position of.
 * @param enabled to only enable for article pages.
 * @returns the current or last recorded scroll position.
 */
export function useArticleScrollPosition( ref: React.RefObject< HTMLElement >, enabled: boolean ) {
	const [ scrollPosition, setScrollPosition ] = useState( cachedScrollPosition );

	useEffect( () => {
		const element = ref?.current;

		const handleScroll = () => {
			if ( element ) {
				setScrollPosition( ( cachedScrollPosition = ref.current.scrollTop ) );
			}
		};
		if ( enabled ) {
			element?.addEventListener( 'scroll', handleScroll );
		} else {
			// Reset the cached scroll position when the HC is closed or the article page is unmounted.
			cachedScrollPosition = 0;
		}
		return () => {
			element?.removeEventListener( 'scroll', handleScroll );
		};
	}, [ ref, enabled ] );

	return scrollPosition;
}
