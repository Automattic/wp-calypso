import { useEffect, useState } from '@wordpress/element';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
let cachedScrollPositions: Record< string, number > = {};

/**
 * Persists the scroll position the scrollable container in memory and returns it. Keyed by article URL to persist multiple scroll positions for every open article.
 * @param ref the HTML element to track the scroll position of.
 * @param url the pathname+search of the current route.
 * @returns the current or last recorded scroll position.
 */
export function useArticleScrollPosition( ref: React.RefObject< HTMLElement >, url: string ) {
	const [ scrollPositions, setScrollPositions ] = useState( cachedScrollPositions );

	useEffect( () => {
		const handleScroll = ( event: { target: EventTarget | null } ) => {
			if ( event.target === ref.current ) {
				if ( url.startsWith( '/post' ) && event.target && 'scrollTop' in event.target ) {
					const positions = { ...cachedScrollPositions };
					positions[ url ] = Number( event.target?.scrollTop );
					setScrollPositions( ( cachedScrollPositions = positions ) );
				}
			}
		};
		window.addEventListener( 'scroll', handleScroll, true );

		// When the Help Center is closed and reopened, the scroll position should be reset.
		if ( ! url.startsWith( '/post' ) ) {
			setScrollPositions( ( cachedScrollPositions = {} ) );
		}

		return () => window.removeEventListener( 'scroll', handleScroll );
	}, [ ref, url ] );

	return scrollPositions;
}
