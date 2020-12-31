/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Local dependencies
 */
import './style.scss';

const FULLSCREEN_MODE = 'is-fullscreen-mode';

export default function FullscreenMode() {
	const { fullscreenMode } = useSelect(
		( select ) => ( {
			fullscreenMode: select( 'isolated/editor' ).isOptionActive( 'fullscreenMode' ),
		} ),
		[]
	);

	useEffect( () => {
		// Also do it on html as .com adds a top margin there
		if ( fullscreenMode ) {
			document.body.classList.add( FULLSCREEN_MODE );
			document.querySelector( 'html' ).classList.add( FULLSCREEN_MODE );
		} else {
			document.body.classList.remove( FULLSCREEN_MODE );
			document.querySelector( 'html' ).classList.remove( FULLSCREEN_MODE );
		}
	}, [ fullscreenMode ] );

	return null;
}
