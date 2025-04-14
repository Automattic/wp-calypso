import Color from 'colorjs.io';
import { generateRadixColors } from './color';
import type { ThemeProps } from '../../types';

function radixColorsToCSS( colors: ReturnType< typeof generateRadixColors > ) {
	const outputCSS: React.CSSProperties = {};

	colors.grayScale.forEach( ( color, index ) => {
		outputCSS[ `--radix-neutral-${ index }` ] = color;
	} );

	colors.accentScale.forEach( ( color, index ) => {
		outputCSS[ `--radix-primary-${ index }` ] = color;
	} );

	return outputCSS;
}

export function useGenerateRadixStyles( color: ThemeProps[ 'color' ] ): React.CSSProperties {
	const primaryColor = new Color( color.primary );
	const primaryHue = primaryColor.hsl.h;

	// TODO: missing semantic tokens
	return radixColorsToCSS(
		generateRadixColors( {
			accent: color.primary,
			appearance: color.scheme ?? 'light',
			background: color.scheme === 'light' ? '#fff' : '#000',
			gray: `hsl(${ primaryHue }deg ${ color.fun }% 50%)`,
		} )
	);
}
