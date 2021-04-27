/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

export function useBodyClass( classname: string, shouldApplyClass: boolean ): void {
	const appliedClass = useRef( '' );

	useEffect( () => {
		if ( shouldApplyClass ) {
			appliedClass.current = classname;
			window.document.body.classList.add( classname );
		}

		return () => {
			if ( appliedClass.current ) {
				window.document.body.classList.remove( appliedClass.current );
				appliedClass.current = '';
			}
		};
	}, [ shouldApplyClass, classname ] );
}
