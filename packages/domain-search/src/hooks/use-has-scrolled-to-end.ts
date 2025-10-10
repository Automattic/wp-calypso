import { RefObject, useEffect, useState } from 'react';
import { hasScrolledToEnd } from '../helpers/has-scrolled-to-end';

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
