import { useRtl } from 'i18n-calypso';
import { useState, useEffect } from 'react';

interface UseScrollProps {
	selector: string;
	enabled: boolean;
}

const isScrolledToEnd = ( element, isRtl ) => {
	if ( isRtl ) {
		const scrollLeft = Math.abs( element.scrollLeft );
		return scrollLeft <= 1;
	}

	return element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
};

const useHorizontalScroll = ( { selector, enabled }: UseScrollProps ) => {
	const [ isScrolledEnd, setIsScrolledEnd ] = useState( false );
	const isRtl = useRtl();

	useEffect( () => {
		const handleScroll = ( event ) => {
			if ( event.currentTarget ) {
				setIsScrolledEnd( isScrolledToEnd( event.currentTarget, isRtl ) );
			}
		};

		let scrollContainer;
		if ( enabled ) {
			scrollContainer = document.querySelector( selector );
			if ( scrollContainer ) {
				scrollContainer.addEventListener( 'scroll', handleScroll );
			}
		}

		return () => {
			if ( scrollContainer ) {
				scrollContainer.removeEventListener( 'scroll', handleScroll );
			}
		};
	}, [ isRtl, selector, enabled ] );

	return isScrolledEnd;
};

export default useHorizontalScroll;
