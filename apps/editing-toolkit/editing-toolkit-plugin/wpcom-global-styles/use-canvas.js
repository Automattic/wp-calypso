import { subscribe, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';

export function useCanvas() {
	const [ canvas, setCanvas ] = useState();
	const [ viewCanvasPath, setViewCanvasPath ] = useState();

	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ), [] );

	// Since Gutenberg doesn't provide a stable selector to get canvas data,
	// we need to infer it from the URL.
	useEffect( () => {
		if ( ! isSiteEditor ) {
			return;
		}

		const unsubscribe = subscribe( () => {
			const params = new URLSearchParams( window.location.search );

			const _canvas = params.get( 'canvas' ) ?? 'view';
			setCanvas( _canvas );
			setViewCanvasPath( _canvas === 'view' ? params.get( 'path' ) : undefined );
		} );

		return () => unsubscribe();
	}, [ isSiteEditor ] );

	return { canvas, viewCanvasPath };
}
