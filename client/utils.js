// Adapts route paths to also include wildcard
// subroutes under the root level section.
export function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

// takes in a fn where its last arg is a node-style callback
// outputs a promise
export const promisify = ( fn ) => ( ...args ) =>
	new Promise( ( resolve, reject ) => {
		fn( ...args, ( err, data ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( data );
			}
		} );
	} );
