export function getFormattedNumber( value: number | string, dec = 2 ) {
	return Number( Number( value ?? 0 ).toFixed( dec ) );
}

export function getFormattedSize( size: number ) {
	const i = size === 0 ? 0 : Math.floor( Math.log( size ) / Math.log( 1024 ) );
	return (
		+( size / Math.pow( 1024, i ) ).toFixed( 2 ) * 1 + ' ' + [ 'B', 'kB', 'MB', 'GB', 'TB' ][ i ]
	);
}
