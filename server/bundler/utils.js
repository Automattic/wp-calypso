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

function pathToRegExp( path ) {
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

module.exports = {
	getAssets: getAssets,
	pathToRegExp: pathToRegExp
};
