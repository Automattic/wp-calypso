import { useEffect, useMemo, useState, RefObject } from 'react';

// Determines if an element is visible on screen or not.

function useOnScreen( ref: RefObject< HTMLElement > ): boolean {
	const [ isIntersecting, setIntersecting ] = useState( false );

	const observer = useMemo(
		() => new IntersectionObserver( ( [ entry ] ) => setIntersecting( entry.isIntersecting ) ),
		[]
	);

	useEffect( () => {
		if ( ref.current ) {
			observer.observe( ref.current );
		}
		return () => observer.disconnect();
	}, [ observer, ref ] );

	return isIntersecting;
}

export default useOnScreen;
