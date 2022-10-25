import { RefObject, useEffect, useRef } from 'react';

export function useInView< T extends Element >( oneTimeCallback: () => void ): RefObject< T > {
	const viewedRef = useRef( false );
	const elementRef = useRef< T >( null );
	const oneTimeCallbackRef = useRef< () => void >();

	useEffect( () => {
		oneTimeCallbackRef.current = oneTimeCallback;
	}, [ oneTimeCallback ] );

	useEffect( () => {
		// We can't do anything without a valid reference to an element on the page
		if ( ! elementRef.current ) {
			return;
		}

		const handler = ( entries: IntersectionObserverEntry[] ) => {
			// Only fire once per page load
			if ( viewedRef.current ) {
				return;
			}

			const [ entry ] = entries;
			if ( ! entry.isIntersecting ) {
				return;
			}

			oneTimeCallbackRef.current?.();
			viewedRef.current = true;
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			observer.disconnect();
		};

		const observer = new IntersectionObserver( handler, {
			// Only fire the event when 100% of the element becomes visible
			threshold: [ 1 ],
		} );
		observer.observe( elementRef.current );

		// When the effect is dismounted, stop observing
		return () => observer.disconnect();
	}, [ oneTimeCallbackRef, viewedRef, elementRef ] );

	return elementRef;
}
