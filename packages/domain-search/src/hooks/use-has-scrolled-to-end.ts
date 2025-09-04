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

			if ( scrollHeight - scrollTop === clientHeight ) {
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
