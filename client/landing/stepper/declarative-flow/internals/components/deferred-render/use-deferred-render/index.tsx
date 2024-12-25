import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDeferredRenderProps {
	timeMs: number;
}

export const useDeferredRender = ( { timeMs }: UseDeferredRenderProps ) => {
	const [ isReadyToRender, setIsReadyToRender ] = useState( false );
	const timeoutId = useRef< number | null >( null );

	useEffect( () => {
		const id = window.setTimeout( () => {
			setIsReadyToRender( true );
		}, timeMs );

		timeoutId.current = id;

		return () => {
			if ( timeoutId.current ) {
				window.clearTimeout( timeoutId.current );
			}
		};
	}, [ timeMs ] );

	const startDelayedRendering = useCallback( () => {
		setIsReadyToRender( true );
	}, [] );

	return {
		isReadyToRender,
		startDelayedRendering,
	};
};
