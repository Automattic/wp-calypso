import { useMemo } from 'react';
import type { FontFamily } from '../../types';

interface Props {
	fontFamilies: FontFamily[];
	onLoad?: () => void;
}

// See https://developers.google.com/fonts/docs/css2
const FONT_API_BASE = 'https://fonts-api.wp.com/css2';

const FONT_AXIS = 'ital,wght@0,400;0,700;1,400;1,700';

// Fix to avoid error in Google Fonts API
const removeSingleQuotes = ( fontFamily: string ) => fontFamily.replaceAll( "'", '' );

const FontFamiliesLoader = ( { fontFamilies, onLoad }: Props ) => {
	const params = useMemo(
		() =>
			new URLSearchParams( [
				...fontFamilies.map( ( { fontFamily } ) => [
					'family',
					`${ removeSingleQuotes( fontFamily ) }:${ FONT_AXIS }`,
				] ),
				[ 'display', 'swap' ],
			] ),
		fontFamilies
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
