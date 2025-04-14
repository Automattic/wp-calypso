import Color from 'colorjs.io';
import { generateRadixColors } from './color';
import type { ThemeProps, ColorBaseTokens } from '../../types';

// function radixColorsToCSS( colors: ReturnType< typeof generateRadixColors > ) {
// 	const outputCSS: React.CSSProperties = {};

// 	colors.grayScale.forEach( ( color, index ) => {
// 		outputCSS[ `--radix-neutral-scale-${ index }` ] = color;
// 	} );

// 	colors.accentScale.forEach( ( color, index ) => {
// 		outputCSS[ `--radix-primary-scale-${ index }` ] = color;
// 	} );

// 	return outputCSS;
// }

export function generateBaseTokens( color: ThemeProps[ 'color' ] ) {
	const primaryColor = new Color( color.primary );
	const primaryHue = primaryColor.hsl.h;

	const allRadixColors = generateRadixColors( {
		accent: color.primary,
		appearance: color.scheme ?? 'light',
		background: color.scheme === 'light' ? '#fff' : '#000',
		gray: `hsl(${ primaryHue }deg ${ color.fun }% 50%)`,
	} );

	return {
		[ 'neutral-scale' ]: allRadixColors.grayScale,
		[ 'primary-scale' ]: allRadixColors.accentScale,
	} as ColorBaseTokens;
}
