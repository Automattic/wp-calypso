import { RefObject, useEffect, useRef } from 'react';

export function useInView< T extends Element >( oneTimeCallback: () => void ): RefObject< T > {
	const viewedRef = useRef< boolean >( false );
	const elementRef = useRef< T >( null );
	const observerRef = useRef< IntersectionObserver >();

	useEffect( () => {
		// We can't do anything without a valid reference to an element on the page
		if ( ! elementRef.current ) {
			return;
		}

		// If the observer is already defined, no need to continue
		if ( observerRef.current ) {
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

			oneTimeCallback();

			viewedRef.current = true;
		};

		observerRef.current = new IntersectionObserver( handler, {
			// Only fire the event when 100% of the element becomes visible
			threshold: [ 1 ],
		} );
		observerRef.current.observe( elementRef.current );

		// When the effect is dismounted, stop observing
		return () => observerRef.current?.disconnect?.();
	}, [ oneTimeCallback ] );

	return elementRef;
}
