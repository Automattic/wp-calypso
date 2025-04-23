import Color from 'colorjs.io';
import { ThemeProps, TokensObject } from '../types';
import { generateColorScales } from './algos';
import { COLOR_MAP } from './map';
import { mapColorsToScale } from './utils';

export function generateColors( color: ThemeProps[ 'color' ] ) {
	// Bridge the gap between color algos and our API surface.
	const primaryColor = new Color( color.primary );
	const primaryHue = primaryColor.hsl.h;

	const colorScales = generateColorScales( {
		accent: color.primary,
		appearance: color.scheme ?? 'light',
		gray: `hsl(${ primaryHue }deg ${ color.fun }% 50%)`,
	} );

	return {
		background: colorScales.background,
		[ 'neutral-scale' ]: colorScales.grayScale,
		[ 'primary-scale' ]: colorScales.accentScale,
		neutral: mapColorsToScale( colorScales.grayScale, COLOR_MAP ),
		primary: mapColorsToScale( colorScales.accentScale, COLOR_MAP ),
	} as TokensObject;
}
