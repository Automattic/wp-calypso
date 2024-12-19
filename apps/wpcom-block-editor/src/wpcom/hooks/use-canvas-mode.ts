import { subscribe, useSelect } from '@wordpress/data';
import { useEffect, useState } from 'react';

const useCanvasMode = () => {
	const [ canvasMode, setCanvasMode ] = useState< string | null >( null );
	const isSiteEditor = useSelect( ( select ) => !! select( 'core/edit-site' ), [] );

	useEffect( () => {
		// The canvas mode is limited to the site editor.
		if ( ! isSiteEditor ) {
			return;
		}

		const unsubscribe = subscribe( () => {
			const mode = new URLSearchParams( window.location?.search ).get( 'canvas' ) || 'view';
			setCanvasMode( mode );
		} );

		return () => unsubscribe();
	}, [ isSiteEditor ] );

	return canvasMode;
};

export default useCanvasMode;
