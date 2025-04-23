import Color from 'colorjs.io';
import { ThemeProps, TokensObject } from '../types';
import { generateColorScales } from './algos';
import { COLOR_MAP } from './map';
import { amber, green, red, blue } from './preset-scales';
import { mapColorsToScale } from './utils';

export function generateColors( color: ThemeProps[ 'color' ] ) {
	// Bridge the gap between color algos and our API surface.
	const primaryColor = new Color( color.primary );
	const primaryHue = primaryColor.hsl.h;

	const colorScales = generateColorScales( {
		accent: color.primary,
		info: color.info ?? blue.blue9,
		success: color.success ?? green.green9,
		warning: color.warning ?? amber.amber9,
		error: color.error ?? red.red9,
		appearance: color.scheme ?? 'light',
		gray: `hsl(${ primaryHue }deg ${ color.fun }% 50%)`,
	} );

	return {
		background: colorScales.background,
		// TODO: need contrast text for neutral?
		[ 'neutral-scale' ]: colorScales.grayScale,
		neutral: mapColorsToScale( colorScales.grayScale, COLOR_MAP ),
		// Primary
		[ 'primary-scale' ]: colorScales.accentScale,
		[ 'primary-contrast-small' ]: colorScales.accentContrastSmallText,
		[ 'primary-contrast-large' ]: colorScales.accentContrastLargeText,
		primary: mapColorsToScale( colorScales.accentScale, COLOR_MAP ),
		// Info
		[ 'info-scale' ]: colorScales.infoScale,
		[ 'info-contrast-small' ]: colorScales.infoContrastSmallText,
		[ 'info-contrast-large' ]: colorScales.infoContrastLargeText,
		info: mapColorsToScale( colorScales.infoScale, COLOR_MAP ),
		// Success
		[ 'success-scale' ]: colorScales.successScale,
		[ 'success-contrast-small' ]: colorScales.successContrastSmallText,
		[ 'success-contrast-large' ]: colorScales.successContrastLargeText,
		success: mapColorsToScale( colorScales.successScale, COLOR_MAP ),
		// Warning
		[ 'warning-scale' ]: colorScales.warningScale,
		[ 'warning-contrast-small' ]: colorScales.warningContrastSmallText,
		[ 'warning-contrast-large' ]: colorScales.warningContrastLargeText,
		warning: mapColorsToScale( colorScales.warningScale, COLOR_MAP ),
		// Error
		[ 'error-scale' ]: colorScales.errorScale,
		[ 'error-contrast-small' ]: colorScales.errorContrastSmallText,
		[ 'error-contrast-large' ]: colorScales.errorContrastLargeText,
		error: mapColorsToScale( colorScales.errorScale, COLOR_MAP ),
	} as TokensObject;
}
