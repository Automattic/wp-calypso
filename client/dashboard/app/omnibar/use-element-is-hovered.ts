import { useEffect, useState } from 'react';

/**
 * Reports whether the pointer is currently over an element matching `selector`.
 * The omnibar's panels render in portals the plugin can't hold a ref to, so this
 * hit-tests by selector at the document level. Callers pair it with the panel's
 * open state (e.g. `isOpen && isHovered`) to keep a button active while the
 * pointer is over its open panel.
 * @param selector CSS selector matching the element to watch.
 */
export function useElementIsHovered( selector: string ): boolean {
	const [ isHovered, setIsHovered ] = useState( false );

	useEffect( () => {
		const handlePointerOver = ( event: PointerEvent ) => {
			const target = event.target as Element | null;
			setIsHovered( !! target?.closest( selector ) );
		};

		// Pointer leaving the document entirely never fires a follow-up
		// pointerover, so clear the state explicitly.
		const handlePointerOut = ( event: PointerEvent ) => {
			if ( ! event.relatedTarget ) {
				setIsHovered( false );
			}
		};

		document.addEventListener( 'pointerover', handlePointerOver );
		document.addEventListener( 'pointerout', handlePointerOut );
		return () => {
			document.removeEventListener( 'pointerover', handlePointerOver );
			document.removeEventListener( 'pointerout', handlePointerOut );
		};
	}, [ selector ] );

	return isHovered;
}
