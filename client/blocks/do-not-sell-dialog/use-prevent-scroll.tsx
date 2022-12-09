import { useEffect } from 'react';

/*
    Pages in wp-calypso that have footer (and require Do Not Sell Dialog) are scrollable (body height > 100vh).
    This hook prevents scrolling when the dialog is open while not implementing any new external dependencies for the dialog.

    Solution reference: https://github.com/reactjs/react-modal/issues/191#issuecomment-1155467966
*/
export const usePreventScroll = ( isOpen: boolean ) => {
	useEffect( () => {
		if ( isOpen ) {
			const x = window.scrollX;
			const y = window.scrollY;

			const disableScroll = () => {
				window.scrollTo( x, y );
			};
			window.addEventListener( 'scroll', disableScroll );
			return () => {
				window.removeEventListener( 'scroll', disableScroll );
			};
		}
	}, [ isOpen ] );
};
