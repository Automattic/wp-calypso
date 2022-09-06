import { useCallback, useEffect, useState } from 'react';

interface UseScrollToTopOptions< T > {
	scrollTargetRef: React.MutableRefObject< T | null >;
	smoothScrolling: boolean;
	isBelowThreshold: ( scrollTarget: T ) => boolean;
}
type ScrollTarget = HTMLElement | Window;
export const useScrollToTop = < T extends ScrollTarget >( {
	scrollTargetRef,
	smoothScrolling,
	isBelowThreshold,
}: UseScrollToTopOptions< T > ) => {
	const [ isButtonVisible, setVisible ] = useState( false );

	const scrollCallback = useCallback( () => {
		if ( scrollTargetRef.current ) {
			setVisible( isBelowThreshold( scrollTargetRef.current ) );
		}
	}, [ scrollTargetRef, isBelowThreshold ] );

	useEffect( () => {
		if ( scrollTargetRef.current ) {
			const scrollElement = scrollTargetRef.current;

			scrollElement.addEventListener( 'scroll', scrollCallback );

			return () => {
				scrollElement.removeEventListener( 'scroll', scrollCallback );
			};
		}
	}, [ scrollTargetRef, scrollCallback ] );

	const scrollToTop = useCallback( () => {
		if ( ! scrollTargetRef.current ) {
			return;
		}

		scrollTargetRef.current.scrollTo( {
			top: 0,
			behavior: smoothScrolling ? 'smooth' : 'auto',
		} );
	}, [ scrollTargetRef, smoothScrolling ] );

	return {
		scrollToTop,
		isButtonVisible,
	};
};
