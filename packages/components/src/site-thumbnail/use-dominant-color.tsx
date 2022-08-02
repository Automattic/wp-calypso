import FastAverageColor, { IFastAverageColorResult } from 'fast-average-color';
import { useEffect, useState } from 'react';

export default function useDominantColor(
	url?: string,
	elementRef?: React.MutableRefObject< HTMLImageElement >
) {
	const [ color, setColor ] = useState< IFastAverageColorResult >();

	useEffect( () => {
		const fac = new FastAverageColor();
		const resource = url || elementRef?.current;
		if ( ! resource ) {
			return;
		}
		fac
			.getColorAsync( resource, {
				ignoredColor: [
					[ 255, 255, 255, 255 ], // white
					[ 0, 0, 0, 255 ], // black
				],
			} )
			.then( ( color ) => setColor( color ) );
	}, [ url, elementRef ] );
	return color;
}
