import { useState } from 'react';
import type { CSSProperties } from 'react';

const useZoomOut = () => {
	const [ zoomOutScale, setZoomOutScale ] = useState( 1 );

	const zoomOutStyles = {
		width: '100%',
		transform: `scale( ${ zoomOutScale } )`,
		transformOrigin: 'top',
	} as CSSProperties;

	const onZoomOutScaleChange = ( value: number ) => setZoomOutScale( value );

	return {
		zoomOutScale,
		zoomOutStyles,
		onZoomOutScaleChange,
	};
};

export default useZoomOut;
