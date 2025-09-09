import { RefObject, useEffect, useState } from 'react';

export const useHasScrolledToEnd = ( contentRef: RefObject< HTMLElement > ) => {
	const [ hasScrolledToEnd, setHasScrolledToEnd ] = useState( false );

	useEffect( () => {
		const contentElement = contentRef.current;

		if ( ! contentElement ) {
			return;
		}

		const checkIfScrollHasReachedBottom = () => {
			const { scrollHeight, scrollTop, clientHeight } = contentElement;

			// NOTE: scrollTop is fractional, while scrollHeight and clientHeight are
			// not, so without this Math.abs() trick then sometimes the result won't
			// work because scrollTop may not be exactly equal to el.scrollHeight -
			// el.clientHeight when scrolled to the bottom.
			if ( Math.abs( scrollHeight - clientHeight - scrollTop ) < 1 ) {
				setHasScrolledToEnd( true );
			}
		};

		checkIfScrollHasReachedBottom();

		contentElement.addEventListener( 'scroll', checkIfScrollHasReachedBottom );

		return () => {
			contentElement.removeEventListener( 'scroll', checkIfScrollHasReachedBottom );
		};
	}, [ contentRef ] );

	return hasScrolledToEnd;
};
