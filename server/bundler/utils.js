function getAssets( stats ) {
	var chunks = stats.chunks;

	return chunks.map( function( chunk ) {
		var filename = chunk.files[ 0 ];
		return {
			name: chunk.names[ 0 ],
			hash: chunk.hash,
			file: filename,
			url: stats.publicPath + filename,
			size: chunk.size
		};
	} );
}

// Adapts route paths to also include wildcard
// subroutes under the root level section.
function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

module.exports = {
	getAssets: getAssets,
	pathToRegExp: pathToRegExp
};
