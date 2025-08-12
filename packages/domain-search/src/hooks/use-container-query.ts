import { useEvent, useResizeObserver } from '@wordpress/compose';
import { useLayoutEffect, useRef, useState } from 'react';

export const useContainerQuery = < T extends string >(
	queries: Record< T, number >
): {
	ref: ( element: Element | null | undefined ) => void;
	activeQuery: T;
} => {
	const [ activeQuery, setActiveQuery ] = useState< T >( Object.keys( queries )[ 0 ] as T );

	const initialMountRef = useRef< Element | null | undefined >( null );

	const callback = useEvent( ( width: number ) => {
		const query = Object.entries< number >( queries ).findLast( ( [ , value ] ) => width >= value );
		if ( query ) {
			setActiveQuery( query[ 0 ] as T );
		}
	} );

	useLayoutEffect( () => {
		if ( ! initialMountRef.current ) {
			return;
		}

		callback( initialMountRef.current.getBoundingClientRect().width );
	}, [ callback ] );

	const resizableContainerRef = useResizeObserver( ( [ element ] ) => {
		callback( element.contentRect.width );
	} );

	return {
		ref: ( element ) => {
			initialMountRef.current = element;
			resizableContainerRef( element );
		},
		activeQuery,
	};
};
