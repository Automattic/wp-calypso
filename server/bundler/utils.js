var path = require( 'path' );

function getAssets( stats ) {
	var chunks = stats.chunks;

	return chunks.map( function( chunk ) {
		var filename = chunk.files[0];
		return {
			name: chunk.names[0],
			hash: chunk.hash,
			file: filename,
			url: path.resolve( stats.publicPath, filename )
		};
	} );
}

function pathToRegExp( path ) {
	return new RegExp( '^' + path + '(/.*)?$' );
}

/**
 * Node 0.x does not correctly escape slashes in `RegExp.prototype.toString`,
 * but node 4.x does. This is a polyfill that should return the escaped string
 * in either version. It can also accept any other object that has a `toString`
 * method (like Strings).
 */
function regExpToString( exp ) {
	var str = exp.toString();
	if ( /\\\//.test( str ) ) {
		return str;
	}
	return str.replace( /\//g, '\\/' );
}

module.exports = {
	getAssets: getAssets,
	pathToRegExp: pathToRegExp,
	regExpToString: regExpToString
};
