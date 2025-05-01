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
		if ( typeof window === 'undefined' || ! enabled ) {
			return () => {};
		}

		const scrollContainer = document.querySelector( selector );

		const handleIsScrolledEnd = () => {
			if ( scrollContainer ) {
				setIsScrolledEnd( isScrolledToEnd( scrollContainer ) );
			}
		};

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
