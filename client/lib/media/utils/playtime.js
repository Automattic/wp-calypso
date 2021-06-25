/**
 * Returns a human-readable string representing the specified seconds
 * duration.
 *
 * @example
 * playtime( 7 ); // -> "0:07"
 *
 * @param  {number} duration Duration in seconds
 * @returns {string}          Human-readable duration
 */
export function playtime( duration ) {
	if ( isNaN( duration ) ) {
		return;
	}

	const hours = Math.floor( duration / 3600 );
	const minutes = Math.floor( duration / 60 ) % 60;
	const seconds = Math.floor( duration ) % 60;

	let runtime = [ minutes, seconds ]
		.map( function ( value ) {
			return ( '0' + value ).slice( -2 );
		} )
		.join( ':' );

	if ( hours ) {
		runtime = [ hours, runtime ].join( ':' );
	}

	runtime = runtime.replace( /^(00:)+/g, '' );

	if ( -1 === runtime.indexOf( ':' ) ) {
		runtime = '0:' + runtime;
	}

	return runtime.replace( /^0(\d)(.*)/, '$1$2' );
}
