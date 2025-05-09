/**
 * WordPress dependencies
 */
import { useDebounce } from '@wordpress/compose';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { isRTL } from '@wordpress/i18n';

const isScrolledToEnd = ( element: Element ) => {
	if ( isRTL() ) {
		const scrollLeft = Math.abs( element.scrollLeft );
		return scrollLeft <= 1;
	}

	return element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
};

/**
 * A hook to check if a given scroll container has reached the horizontal scroll end.
 *
 * The current way receives "refs" as arguments, but it lacks a mechanism to detect when a ref has changed.
 * As a result, when the "ref" is updated and attached to a new div, the computation should trigger again.
 * However, this isn't possible in the current setup because the hook is unaware that the ref has changed.
 * See https://github.com/Automattic/wp-calypso/pull/103005#discussion_r2077567912.
 */
export function useIsHorizontalScrollEnd( {
	scrollContainerRef,
	enabled = false,
}: {
	scrollContainerRef: React.MutableRefObject< HTMLDivElement | null >;
	enabled?: boolean;
} ): boolean {
	const [ isHorizontalScrollEnd, setIsHorizontalScrollEnd ] =
		useState( false );

	const handleIsHorizontalScrollEnd = useDebounce(
		useCallback( () => {
			const scrollContainer = scrollContainerRef.current;
			if ( scrollContainer ) {
				setIsHorizontalScrollEnd( isScrolledToEnd( scrollContainer ) );
			}
		}, [ scrollContainerRef, setIsHorizontalScrollEnd ] ),
		200
	);

	useEffect( () => {
		if (
			typeof window === 'undefined' ||
			! enabled ||
			! scrollContainerRef.current
		) {
			return () => {};
		}

		handleIsHorizontalScrollEnd();
		scrollContainerRef.current.addEventListener(
			'scroll',
			handleIsHorizontalScrollEnd
		);
		window.addEventListener( 'resize', handleIsHorizontalScrollEnd );

		return () => {
			scrollContainerRef.current?.removeEventListener(
				'scroll',
				handleIsHorizontalScrollEnd
			);
			window.removeEventListener( 'resize', handleIsHorizontalScrollEnd );
		};
	}, [ scrollContainerRef, enabled ] );

	return isHorizontalScrollEnd;
}
