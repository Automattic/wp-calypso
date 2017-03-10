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
					"// start chunk loading",
					"installedChunks[ chunkId ] = [ callback ];",
					"window.__chunkErrors = window.__chunkErrors || {};",
					"window.__chunkErrors[ chunkName ]=null;",
					"var head = document.getElementsByTagName( 'head' )[ 0 ];",
					"var script = document.createElement( 'script' );",
					"var isDebug = window.app.isDebug;",
					"script.type = 'text/javascript';",
					"script.charset = 'utf-8';",
					"script.async = true;",
					"script.onerror = function() {",
					this.indent( [
						"script.onerror = script.onload = script.onreadystatechange = null;",
						"delete installedChunks[ chunkId ];",
						"window.__chunkErrors[ chunkName ] = new Error( 'could not load ' + chunkName );",
						"callback.call( null, " + this.requireFn + ")"
					] ),
					"};",
					"script.src = " + this.requireFn + ".p + ( chunkName ) + '.' + ( chunkHash ) + ( isDebug ? '' : '.m' ) + '.js';",
					"head.appendChild( script );"
				] ),
				"}"
			] );

		} );
	});
};

module.exports = ChunkFileNames;
