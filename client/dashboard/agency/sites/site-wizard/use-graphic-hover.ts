import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export default function useGraphicHover( ref: RefObject< Element | null > ) {
	const [ hovered, setHovered ] = useState( false );
	useEffect( () => {
		const graphic = ref.current?.closest( '.agency-sites-story__graphic' );
		if (
			! graphic ||
			typeof window.matchMedia !== 'function' ||
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		) {
			return;
		}
		const enter = () => setHovered( true );
		const leave = () => setHovered( false );
		graphic.addEventListener( 'pointerenter', enter );
		graphic.addEventListener( 'pointerleave', leave );
		return () => {
			graphic.removeEventListener( 'pointerenter', enter );
			graphic.removeEventListener( 'pointerleave', leave );
		};
	}, [ ref ] );
	return hovered;
}
