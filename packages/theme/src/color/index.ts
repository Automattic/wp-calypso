import Color from 'colorjs.io';
import { ThemeProps, TokensObject } from '../types';
import { generateColorScales } from './algos';
import { mapColors } from './map';

export function generateColors( color: ThemeProps[ 'color' ] ) {
	// Bridge the gap between color algos and our API surface.
	const primaryColor = new Color( color.primary );
	const primaryHue = primaryColor.hsl.h;

	const colorScales = generateColorScales( {
		accent: color.primary,
		appearance: color.scheme ?? 'light',
		// TODO: check correctness of background values
		background: color.scheme === 'light' ? '#fff' : '#000',
		gray: `hsl(${ primaryHue }deg ${ color.fun }% 50%)`,
	} );

	return {
		[ 'neutral-scale' ]: colorScales.grayScale,
		[ 'primary-scale' ]: colorScales.accentScale,
		neutral: mapColors( colorScales.grayScale ),
		primary: mapColors( colorScales.accentScale ),
	} as TokensObject;
}
