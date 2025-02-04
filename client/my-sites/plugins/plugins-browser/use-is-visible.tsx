import { RefObject, useEffect, useMemo, useState } from 'react';

export default function useIsVisible(
	ref: RefObject< HTMLElement >,
	options?: IntersectionObserverInit
) {
	const [ isIntersecting, setIntersecting ] = useState< boolean | undefined >( undefined );

	const observer = useMemo( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}

		return new IntersectionObserver(
			( [ entry ] ) => setIntersecting( entry.isIntersecting ),
			options
		);
	}, [ options ] );

	useEffect( () => {
		if ( ref && ref.current ) {
			observer?.observe( ref.current );
		}
		return () => observer?.disconnect();
	}, [ observer, ref ] );

	return isIntersecting;
}
