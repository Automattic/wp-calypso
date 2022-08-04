import FastAverageColor, { FastAverageColorResult } from 'fast-average-color';
import { useEffect, useState } from 'react';

export default function useDominantColor(
	url?: string,
	imageRef?: React.RefObject< HTMLImageElement >
) {
	const [ color, setColor ] = useState< FastAverageColorResult >();

	useEffect( () => {
		const fac = new FastAverageColor();
		//get the dominant color of a loaded image
		if ( imageRef && imageRef.current ) {
			const color = fac.getColor( imageRef.current, {
				ignoredColor: [
					[ 255, 255, 255, 255 ], // white
					[ 0, 0, 0, 255 ], // black
				],
				width: 50,
				height: 50,
				crossOrigin: 'Anonymous',
			} );
			setColor( color );
		}
		//get the dominant color of image from url
		else if ( url && url.length > 0 ) {
			fac
				.getColorAsync( url, {
					ignoredColor: [
						[ 255, 255, 255, 255 ], // white
						[ 0, 0, 0, 255 ], // black
					],
					crossOrigin: 'anonymous',
				} )
				.then( ( color ) => setColor( color ) )
				.catch( () => {
					return;
				} );
		}
	}, [ url, imageRef ] );
	return color;
}
