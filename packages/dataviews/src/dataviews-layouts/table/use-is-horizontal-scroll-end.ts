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
 */
export function useIsHorizontalScrollEnd( {
	scrollContainerRef,
	enabled = false,
}: {
	scrollContainerRef: React.MutableRefObject< HTMLDivElement | null >;
	enabled?: boolean;
} ): boolean {
	const [ isHorizontalScrollEnd, setIsHorizontalScrollEnd ] = useState( false );

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
