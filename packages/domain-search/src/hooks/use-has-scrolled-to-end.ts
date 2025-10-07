import { RefObject, useEffect, useState } from 'react';

export const hasScrolledToEnd = ( {
	scrollHeight,
	scrollTop,
	clientHeight,
}: {
	scrollHeight: number;
	scrollTop: number;
	clientHeight: number;
} ) => {
	// NOTE: scrollTop might be fractional in some browsers, so without this Math.abs() trick
	// sometimes the result won't be a whole number, causing the comparison to fail.
	return Math.abs( scrollHeight - clientHeight - scrollTop ) < 1;
};

export const useHasScrolledToEnd = ( contentRef: RefObject< HTMLElement > ) => {
	const [ hasScrolledToEndResult, setHasScrolledToEndResult ] = useState( false );

	useEffect( () => {
		const contentElement = contentRef.current;

		if ( ! contentElement ) {
			return;
		}

		const checkIfScrollHasReachedBottom = () => {
			const { scrollHeight, scrollTop, clientHeight } = contentElement;

			if ( hasScrolledToEnd( { scrollHeight, scrollTop, clientHeight } ) ) {
				setHasScrolledToEndResult( true );
			}
		};

		checkIfScrollHasReachedBottom();

		contentElement.addEventListener( 'scroll', checkIfScrollHasReachedBottom );

		return () => {
			contentElement.removeEventListener( 'scroll', checkIfScrollHasReachedBottom );
		};
	}, [ contentRef ] );

	return hasScrolledToEndResult;
};
