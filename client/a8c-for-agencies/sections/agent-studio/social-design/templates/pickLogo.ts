function isDarkColor( hex: string | undefined ): boolean {
	if ( ! hex ) {
		return false;
	}
	const m = hex.trim().match( /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i );
	if ( ! m ) {
		return false;
	}
	let h = m[ 1 ];
	if ( h.length === 3 ) {
		h = h
			.split( '' )
			.map( ( c ) => c + c )
			.join( '' );
	}
	const r = parseInt( h.slice( 0, 2 ), 16 ) / 255;
	const g = parseInt( h.slice( 2, 4 ), 16 ) / 255;
	const b = parseInt( h.slice( 4, 6 ), 16 ) / 255;
	const lin = ( c: number ) =>
		c <= 0.03928 ? c / 12.92 : Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
	const L = 0.2126 * lin( r ) + 0.7152 * lin( g ) + 0.0722 * lin( b );
	return L < 0.5;
}

export function pickLogo(
	bg: string | undefined,
	logoDataUrl: string | undefined,
	logoOnDarkDataUrl: string | undefined
): string | undefined {
	if ( isDarkColor( bg ) && logoOnDarkDataUrl ) {
		return logoOnDarkDataUrl;
	}
	return logoDataUrl ?? logoOnDarkDataUrl;
}
