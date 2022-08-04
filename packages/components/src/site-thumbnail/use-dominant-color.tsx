import FastAverageColor, { FastAverageColorResult } from 'fast-average-color';
import { useEffect, useState } from 'react';

export default function useDominantColor( url?: string ) {
	const [ color, setColor ] = useState< FastAverageColorResult >();

	useEffect( () => {
		const fac = new FastAverageColor();

		//get the dominant color of image from url
		if ( url && url.length > 0 ) {
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
	}, [ url ] );
	return color;
}
