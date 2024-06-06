import { useEffect } from 'react';
import scrollToAnchor from 'calypso/lib/scroll-to-anchor';

export function ScrollToAnchorOnMount( {
	offset = 0,
	timeout = 100,
	container,
}: {
	offset?: number;
	timeout?: number;
	container?: HTMLElement;
} ) {
	useEffect( () => {
		setTimeout( () => {
			scrollToAnchor( { offset, container } );
		}, timeout );
	}, [ offset, timeout, container ] );
	return null;
}
