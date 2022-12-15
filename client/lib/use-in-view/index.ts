import { RefObject, useEffect, useRef } from 'react';

type OptionalProps = {
	[ key: string ]: unknown;
};

export function useInView< T extends Element >(
	oneTimeCallback: () => void,
	optionalProps?: OptionalProps
): RefObject< T > {
	const elementRef = useRef< T >( null );
	const oneTimeCallbackRef = useRef< () => void >();

	oneTimeCallbackRef.current = oneTimeCallback;

	useEffect(
		() => {
			// We can't do anything without a valid reference to an element on the page
			if ( ! elementRef.current ) {
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
				}
			);

			observer.observe( elementRef.current );

			// When the effect is dismounted, stop observing
			return () => observer.disconnect();
		},
		optionalProps ? [ optionalProps ] : []
	);

	return elementRef;
}
