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
	selector,
	enabled = false,
}: {
	selector: string;
	enabled?: boolean;
} ): boolean {
	const [ isScrolledEnd, setIsScrolledEnd ] = useState( false );

	const scrollContainerRef = useRef< Element | null >();

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
		if ( typeof window === 'undefined' || ! enabled ) {
			return () => {};
		}

		const scrollContainer = document.querySelector( selector );
		scrollContainerRef.current = scrollContainer;

		handleIsScrolledEnd();
		if ( scrollContainer ) {
			scrollContainer.addEventListener( 'scroll', handleIsScrolledEnd );
			window.addEventListener( 'resize', handleIsScrolledEnd );
		}

		return () => {
			if ( scrollContainer ) {
				scrollContainer.removeEventListener(
					'scroll',
					handleIsScrolledEnd
				);
				window.removeEventListener( 'resize', handleIsScrolledEnd );
			}
		};
	}, [ selector, enabled ] );

	return isScrolledEnd;
}
