import { useEffect } from 'react';

export function ScrollToTopOnMount() {
	useEffect( () => {
		if ( ! window.location.hash ) {
			window.scrollTo( 0, 0 );
		}
	}, [] );
	return null;
}
