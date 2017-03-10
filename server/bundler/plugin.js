function ChunkFileNames() {
}

ChunkFileNames.prototype.apply = function( compiler ) {
	compiler.plugin("compilation", function( compilation ) {
		compilation.mainTemplate.plugin("require-ensure", function( _, chunk ) {
			var chunkMaps = chunk.getChunkMaps();
			return this.asString( [
				"var chunkNames = " + JSON.stringify( chunkMaps.name, null, '  ' ) + ";",
				"var chunkHashes = " + JSON.stringify( chunkMaps.hash, null, '  ' ) + ";",
				"var chunkName = chunkNames[ chunkId ] || chunkId;",
				"var chunkHash = chunkHashes[ chunkId ] || chunkId;",
				"// \"0\" is the signal for \"already loaded\"",
				"if ( installedChunks[ chunkId ] === 0 ) {",
				this.indent("return callback.call( null, " + this.requireFn + " );"),
				"}",
				"// an array means \"currently loading\".",
				"if ( installedChunks[ chunkId ] !== undefined ) {",
				this.indent( "installedChunks[ chunkId ].push( callback );" ),
				" } else { ",
				this.indent( [
					"function __loadChunk( src ) {",
					this.indent( [
						"var head = document.getElementsByTagName( 'head' )[ 0 ];",
						"var script = document.createElement( 'script' );",
						"script.type = 'text/javascript';",
						"script.charset = 'utf-8';",
						"script.async = true;",
						"script.onerror = function() {",

						this.indent( [
							// try to reload the script once
							"if( src.indexOf( 'retry=1' ) === -1 ) {",
							this.indent( [
								"__loadChunk( src + '?retry=1' );",
								"return;"
							] ),
							"}",
							// attempt to reload the entire app if we hit a chunk loading error
							// a chunk loading error typically means that the application has moved on since it was loaded and
							// the hashes of dependent chunks have changed. We have to reload to pick up the new manifest
							// and the new set of hashes
							"if ( window.location.search.indexOf( 'retry=1' ) === -1 ) { ",
							this.indent( [
								"window.location.search += ( window.location.search ? '&retry=1' : 'retry=1' );",
								"return;"
							] ),
							"}",
							// what should we do here? It appears we can't actually load the app.
							"console && console.error( 'Unable to load ' + chunkName + ' from ' + src );"
						] ),
						"};",
						"script.src = src",
						"head.appendChild( script );"
					] ),
					"}",
					"// start chunk loading",
					"installedChunks[ chunkId ] = [ callback ];",
					"var src = " + this.requireFn + ".p + ( chunkName ) + '.' + ( chunkHash ) + ( window.app.isDebug ? '' : '.m' ) + '.js';",
					"__loadChunk( src )"
				] ),
				"}"
			] );

		} );
	});
};

module.exports = ChunkFileNames;
