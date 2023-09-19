import { useCallback, useEffect, useRef } from 'react';
import { useOdieAssistantContext } from 'calypso/odie/context';

/**
 * Returns a callback for setting an observable node to show the Odie AI assistant
 * when it's intersected in view
 */
const useObservableForOdie = () => {
	const {
		isVisible: isOdieVisible,
		setIsVisible: setIsOdieVisible,
		trackEvent: trackOdieEvent,
	} = useOdieAssistantContext();

	const observer = useRef< IntersectionObserver | null >( null );

	useEffect( () => {
		if ( ! window.IntersectionObserver ) {
			return;
		}

		observer.current = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					if ( ! isOdieVisible ) {
						trackOdieEvent( 'calypso_odie_chat_toggle_visibility', {
							visibility: true,
							trigger: 'scroll',
						} );
						setIsOdieVisible( true );
					}

					observer.current?.disconnect();
				}
			} );
		} );

		return () => {
			observer.current?.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return useCallback( ( observableElement: Element | null ) => {
		if ( null !== observableElement ) {
			observer?.current?.observe( observableElement );
		}
	}, [] );
};

export default useObservableForOdie;
