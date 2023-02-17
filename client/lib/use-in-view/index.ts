import { RefObject, useEffect, useRef } from 'react';

export function useInView< T extends Element >(
	oneTimeCallback: () => void,
	options: IntersectionObserverInit = {},
	dependencies: any[] = []
): RefObject< T > {
	const elementRef = useRef< T >( null );
	const oneTimeCallbackRef = useRef< () => void >();

	// Check IntersectionObserver support
	const hasIntersectionObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;

	oneTimeCallbackRef.current = oneTimeCallback;

	useEffect( () => {
		// We can't do anything without a valid reference to an element on the page
		if ( ! elementRef.current || ! hasIntersectionObserver ) {
			return;
		}

		const observer = new IntersectionObserver(
			( entries ) => {
				const [ entry ] = entries;

				if ( ! entry.isIntersecting ) {
					return;
				}

				oneTimeCallbackRef.current?.();
				observer.disconnect();
			},
			{
				// Only fire the event when 100% of the element becomes visible
				threshold: [ 1 ],
				...options,
			}
		);

		observer.observe( elementRef.current );

		// When the effect is dismounted, stop observing
		return () => observer.disconnect();
	}, dependencies );

	return elementRef;
}
