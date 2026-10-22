import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export default function useSectionHover( ref: RefObject< Element | null > ) {
	const [ hovered, setHovered ] = useState( false );
	useEffect( () => {
		const section = ref.current?.closest( '.agency-sites-story__section' );
		if (
			! section ||
			typeof window.matchMedia !== 'function' ||
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		) {
			return;
		}
		const enter = () => setHovered( true );
		const leave = () => setHovered( false );
		section.addEventListener( 'pointerenter', enter );
		section.addEventListener( 'pointerleave', leave );
		return () => {
			section.removeEventListener( 'pointerenter', enter );
			section.removeEventListener( 'pointerleave', leave );
		};
	}, [ ref ] );
	return hovered;
}
