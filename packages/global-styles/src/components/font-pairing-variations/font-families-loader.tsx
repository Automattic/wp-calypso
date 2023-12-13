import { useMemo } from 'react';
import type { FontFamily } from '../../types';

interface Props {
	fontFamilies: FontFamily[];
	onLoad?: () => void;
}

// See https://developers.google.com/fonts/docs/css2
const FONT_API_BASE = 'https://fonts-api.wp.com/css2';

const FONT_AXIS = 'ital,wght@0,400;0,700;1,400;1,700';

/**
 * Supports the following formats:
 * - Albert Sans
 * - 'Albert Sans'
 * - "Albert Sans", sans-serif
 */
const normalizeFontFamily = ( fontFamily: string ) =>
	fontFamily.split( ',' )[ 0 ].replaceAll( "'", '' ).replaceAll( '"', '' ).trim();

const FontFamiliesLoader = ( { fontFamilies, onLoad }: Props ) => {
	const params = useMemo(
		() =>
			new URLSearchParams( [
				...fontFamilies.map( ( { fontFamily } ) => [
					'family',
					`${ normalizeFontFamily( fontFamily ) }:${ FONT_AXIS }`,
				] ),
				[ 'display', 'swap' ],
			] ),
		[ fontFamilies ]
	);

	if ( ! params.getAll( 'family' ).length ) {
		return null;
	}

	return (
		<link
			rel="stylesheet"
			type="text/css"
			href={ `${ FONT_API_BASE }?${ params }` }
			onLoad={ onLoad }
			onError={ onLoad }
		/>
	);
};

export default FontFamiliesLoader;
