import FastAverageColor, { FastAverageColorResult } from 'fast-average-color';
import { useEffect, useState } from 'react';

const colorMap = new Map< string, FastAverageColorResult >();

export default function useDominantColor( url?: string ) {
	const [ color, setColor ] = useState< FastAverageColorResult | undefined >(
		( url && colorMap.get( url ) ) || undefined
	);

	useEffect( () => {
		const fac = new FastAverageColor();

		//get the dominant color of image from url
		if ( url && url.length > 0 ) {
			if ( colorMap.has( url ) ) {
				return;
			}

			fac
				.getColorAsync( url, {
					ignoredColor: [
						[ 255, 255, 255, 255 ], // white
						[ 0, 0, 0, 255 ], // black
					],
					crossOrigin: 'anonymous',
				} )
				.then( ( color ) => {
					colorMap.set( url, color );
					setColor( color );
				} );
		}

		return () => {
			fac.destroy();
		};
	}, [ url ] );
	return color;
}
