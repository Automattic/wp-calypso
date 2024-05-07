import { useEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function useIsMenuSectionVisible( ref: React.RefObject< HTMLObjectElement > | undefined ) {
	const [ isIntersecting, setIntersecting ] = useState( false );
	const isLoggedIn = useSelector( isUserLoggedIn );

	// the additional pixel is used to automattically trigger the change when
	// the top of the element is at the top of the viewport
	const topbarHeight = 32;
	const menuHeight = 64;
	const totalTopMargin = menuHeight + ( isLoggedIn ? topbarHeight : 0 ) + 1;

	useEffect( () => {
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				setIntersecting( entry.isIntersecting );
			},
			{ rootMargin: `-${ totalTopMargin }px` }
		);

		ref?.current && observer.observe( ref.current );

		return () => {
			observer.disconnect();
		};
	}, [ ref, totalTopMargin ] );

	return isIntersecting;
}
