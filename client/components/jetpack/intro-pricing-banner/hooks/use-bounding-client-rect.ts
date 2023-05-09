import { useState, useLayoutEffect } from 'react';

const useBoundingClientRect = ( eleQuery: string ) => {
	const [ boundingClientRect, setBoundingClientRect ] = useState( {
		bottom: 0,
		height: 0,
		left: 0,
		right: 0,
		top: 0,
		width: 0,
		x: 0,
		y: 0,
	} );

	useLayoutEffect( () => {
		const resizeListener = () => {
			document.querySelectorAll( eleQuery ).forEach( ( node ) => {
				const style = window.getComputedStyle( node, undefined );
				if ( style[ 'display' ] !== 'none' ) {
					setBoundingClientRect( node.getBoundingClientRect() );
				}
			} );
		};

		resizeListener();
		window.addEventListener( 'resize', resizeListener );
	}, [ eleQuery ] );

	return boundingClientRect;
};

export default useBoundingClientRect;
