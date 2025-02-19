// Works also with shorthand hex triplets such as "#03F"
export const hexToRgb = ( hex: string ) => {
	const rgbHex = hex
		.replace(
			/^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i,
			( _m, r, g, b, a ) => '#' + r + r + g + g + b + b + ( a ? a + a : '' )
		)
		.substring( 1 )
		.match( /.{2}/g );

	if ( rgbHex?.length !== 3 && rgbHex?.length !== 4 ) {
		throw 'Unexpected RGB hex value';
	}

	const [ r, g, b, a ] = rgbHex.map( ( x ) => parseInt( x, 16 ) );
	return { r, g, b, a };
};
