import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

function setCustomPropertyForElement< T extends HTMLElement >(
	customProperty: `--${ string }`,
	element: T | null
) {
	const root = document.documentElement;
	if ( ! root.style || ! element ) {
		return;
	}
	const height = element.clientHeight;
	root.style.setProperty( customProperty, `${ height }px` );
}

function removeCustomProperty( customProperty: `--${ string }` ) {
	const root = document.documentElement;
	if ( root.style ) {
		root.style.removeProperty( customProperty );
	}
}

export function useCustomPropertyForHeight< T extends HTMLElement >(
	customProperty: `--${ string }`
): RefObject< T > {
	const elementRef = useRef< T >( null );

	useEffect( () => {
		setCustomPropertyForElement( customProperty, elementRef.current );
		return () => {
			removeCustomProperty( customProperty );
		};
	}, [ customProperty ] );

	useEffect( () => {
		const onResize = () => setCustomPropertyForElement( customProperty, elementRef.current );
		window.addEventListener( 'resize', onResize );
		return () => {
			window.removeEventListener( 'resize', onResize );
		};
	}, [ customProperty ] );

	return elementRef;
}
