function findNearest( input, numbers ) {
	// If the numbers array is empty, return null
	if ( numbers.length === 0 ) {
		return null;
	}
	// Sort the array based on the absolute difference with the input
	numbers.sort( ( a, b ) => Math.abs( input - a ) - Math.abs( input - b ) );
	// Return the first element (which will be the nearest) from the sorted array
	return numbers[ 0 ];
}

function extractFontWeights( fontFaces ) {
	const result = [];

	fontFaces.forEach( ( face ) => {
		const weights = String( face.fontWeight ).split( ' ' );

		if ( weights.length === 2 ) {
			const start = parseInt( weights[ 0 ] );
			const end = parseInt( weights[ 1 ] );

			for ( let i = start; i <= end; i += 100 ) {
				result.push( i );
			}
		} else if ( weights.length === 1 ) {
			result.push( parseInt( weights[ 0 ] ) );
		}
	} );

	return result;
}

/*
 * Format the font family to use in the CSS font-family property of a CSS rule.
 *
 * The input can be a string with the font family name or a string with multiple font family names separated by commas.
 * It follows the recommendations from the CSS Fonts Module Level 4.
 * https://www.w3.org/TR/css-fonts-4/#font-family-prop
 *
 * @param {string} input - The font family.
 * @return {string} The formatted font family.
 *
 * Example:
 * formatFontFamily( "Open Sans, Font+Name, sans-serif" ) => '"Open Sans", "Font+Name", sans-serif'
 * formatFontFamily( "'Open Sans', generic(kai), sans-serif" ) => '"Open Sans", sans-serif'
 * formatFontFamily( "DotGothic16, Slabo 27px, serif" ) => '"DotGothic16","Slabo 27px",serif'
 * formatFontFamily( "Mine's, Moe's Typography" ) => `"mine's","Moe's Typography"`
 */
export function formatFontFamily( input ) {
	// Matches strings that are not exclusively alphabetic characters or hyphens, and do not exactly follow the pattern generic(alphabetic characters or hyphens).
	const regex = /^(?!generic\([ a-zA-Z-]+\)$)(?!^[a-zA-Z-]+$).+/;
	const output = input.trim();

	const formatItem = ( item ) => {
		item = item.trim();
		if ( item.match( regex ) ) {
			// removes leading and trailing quotes.
			item = item.replace( /^["']|["']$/g, '' );
			return `"${ item }"`;
		}
		return item;
	};

	if ( output.includes( ',' ) ) {
		return output
			.split( ',' )
			.map( formatItem )
			.filter( ( item ) => item !== '' )
			.join( ', ' );
	}

	return formatItem( output );
}

/*
 * Format the font face name to use in the font-family property of a font face.
 *
 * The input can be a string with the font face name or a string with multiple font face names separated by commas.
 * It removes the leading and trailing quotes from the font face name.
 *
 * @param {string} input - The font face name.
 * @return {string} The formatted font face name.
 *
 * Example:
 * formatFontFaceName("Open Sans") => "Open Sans"
 * formatFontFaceName("'Open Sans', sans-serif") => "Open Sans"
 * formatFontFaceName(", 'Open Sans', 'Helvetica Neue', sans-serif") => "Open Sans"
 */
export function formatFontFaceName( input ) {
	if ( ! input ) {
		return '';
	}

	let output = input.trim();
	if ( output.includes( ',' ) ) {
		output = output
			.split( ',' )
			// finds the first item that is not an empty string.
			.find( ( item ) => item.trim() !== '' )
			.trim();
	}
	// removes leading and trailing quotes.
	output = output.replace( /^["']|["']$/g, '' );

	// Firefox needs the font name to be wrapped in double quotes meanwhile other browsers don't.
	if ( window.navigator.userAgent.toLowerCase().includes( 'firefox' ) ) {
		output = `"${ output }"`;
	}
	return output;
}

export function getFamilyPreviewStyle( family ) {
	const style = { fontFamily: formatFontFamily( family.fontFamily ) };

	if ( ! Array.isArray( family.fontFace ) ) {
		style.fontWeight = '400';
		style.fontStyle = 'normal';
		return style;
	}

	if ( family.fontFace ) {
		//get all the font faces with normal style
		const normalFaces = family.fontFace.filter(
			( face ) => face?.fontStyle && face.fontStyle.toLowerCase() === 'normal'
		);
		if ( normalFaces.length > 0 ) {
			style.fontStyle = 'normal';
			const normalWeights = extractFontWeights( normalFaces );
			const nearestWeight = findNearest( 400, normalWeights );
			style.fontWeight = String( nearestWeight ) || '400';
		} else {
			style.fontStyle = ( family.fontFace.length && family.fontFace[ 0 ].fontStyle ) || 'normal';
			style.fontWeight =
				( family.fontFace.length && String( family.fontFace[ 0 ].fontWeight ) ) || '400';
		}
	}

	return style;
}

export function getFacePreviewStyle( face ) {
	return {
		fontFamily: formatFontFamily( face.fontFamily ),
		fontStyle: face.fontStyle || 'normal',
		fontWeight: face.fontWeight || '400',
	};
}
