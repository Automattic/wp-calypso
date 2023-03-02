import { useEffect } from 'react';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

export function ScrollToAnchorOnMount() {
	useEffect( () => {
		setTimeout( () => {
			scrollToAnchor( { offset: 30 } );
		}, 100 );
	}, [] );
	return null;
}
