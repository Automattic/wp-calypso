/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
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

	useEffect( () => {
		if ( ! enabled ) {
			return () => {};
		}

		const handleScroll = ( event: {
			currentTarget: EventTarget | null;
		} ) => {
			if ( event.currentTarget ) {
				setIsScrolledEnd(
					isScrolledToEnd( event.currentTarget as Element )
				);
			}
		};

		const scrollContainer = document.querySelector( selector );
		if ( scrollContainer ) {
			scrollContainer.addEventListener( 'scroll', handleScroll );
		}

		return () => {
			if ( scrollContainer ) {
				scrollContainer.removeEventListener( 'scroll', handleScroll );
			}
		};
	}, [ selector, enabled ] );

	return isScrolledEnd;
}
