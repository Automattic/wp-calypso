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

export function useIsScrolledEnd( {
	scrollContainerRef,
	enabled = false,
}: {
	scrollContainerRef: React.MutableRefObject< HTMLDivElement | null >;
	enabled?: boolean;
} ): boolean {
	const [ isScrolledEnd, setIsScrolledEnd ] = useState( false );

	const handleIsScrolledEnd = useDebounce(
		useCallback( () => {
			const scrollContainer = scrollContainerRef.current;
			if ( scrollContainer ) {
				setIsScrolledEnd( isScrolledToEnd( scrollContainer ) );
			}
		}, [ scrollContainerRef, setIsScrolledEnd ] ),
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

		handleIsScrolledEnd();
		scrollContainerRef.current.addEventListener(
			'scroll',
			handleIsScrolledEnd
		);
		window.addEventListener( 'resize', handleIsScrolledEnd );

		return () => {
			scrollContainerRef.current?.removeEventListener(
				'scroll',
				handleIsScrolledEnd
			);
			window.removeEventListener( 'resize', handleIsScrolledEnd );
		};
	}, [ scrollContainerRef, enabled ] );

	return isScrolledEnd;
}
