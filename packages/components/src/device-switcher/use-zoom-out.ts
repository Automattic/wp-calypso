import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

const INITIAL_SCALE = 1;

const useZoomOut = ( onZoomOutScaleChange?: ( value: number ) => void ) => {
	const [ zoomOutScale, setZoomOutScale ] = useState( INITIAL_SCALE );

	const zoomOutStyles = {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
		height: `calc( 100% / ${ zoomOutScale } )`,
		transform: `scale( ${ zoomOutScale } )`,
		transformOrigin: 'top',
	} as CSSProperties;

	const handleZoomOutScaleChange = ( value: number ) => {
		setZoomOutScale( value );
		onZoomOutScaleChange?.( value );
	};

	useEffect( () => {
		onZoomOutScaleChange?.( zoomOutScale );
	}, [] );

	return {
		zoomOutScale,
		zoomOutStyles,
		handleZoomOutScaleChange,
	};
};

export default useZoomOut;
