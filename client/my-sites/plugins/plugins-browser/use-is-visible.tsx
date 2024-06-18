import { RefObject, useEffect, useMemo, useState } from 'react';

export default function useIsVisible( ref: RefObject< HTMLElement > ) {
	const [ isIntersecting, setIntersecting ] = useState< boolean | undefined >( undefined );

	const observer = useMemo(
		() => new IntersectionObserver( ( [ entry ] ) => setIntersecting( entry.isIntersecting ) ),
		[]
	);

	useEffect( () => {
		if ( ref && ref.current ) {
			observer.observe( ref.current );
		}
		return () => observer.disconnect();
	}, [ observer, ref ] );

	return isIntersecting;
}
