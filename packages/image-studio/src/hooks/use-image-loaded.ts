import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

export function useImageLoaded( imageUrl: string | null ): {
	isLoaded: boolean;
	handleLoad: () => void;
	handleError: () => void;
	imageRef: React.MutableRefObject< HTMLImageElement | null >;
	refCallback: ( node: HTMLImageElement | null ) => void;
} {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const imageRef = useRef< HTMLImageElement | null >( null );

	useEffect( () => {
		setIsLoaded( false );
	}, [ imageUrl ] );

	const refCallback = useCallback(
		( node: HTMLImageElement | null ) => {
			imageRef.current = node;

			if ( imageUrl && node?.complete ) {
				setIsLoaded( true );
			}
		},
		[ imageUrl, imageRef ]
	);

	const handleLoad = useCallback( () => {
		setIsLoaded( true );
	}, [] );

	const handleError = useCallback( () => {
		setIsLoaded( true );
	}, [] );

	return { isLoaded, handleLoad, handleError, imageRef, refCallback };
}
