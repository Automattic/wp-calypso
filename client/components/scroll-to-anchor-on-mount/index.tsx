import { useEffect } from 'react';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

export function ScrollToAnchorOnMount( { offset = 0, timeout = 100 } ) {
	useEffect( () => {
		setTimeout( () => {
			scrollToAnchor( { offset } );
		}, timeout );
	}, [ offset, timeout ] );
	return null;
}
