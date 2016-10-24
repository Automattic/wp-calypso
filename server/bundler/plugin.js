function ChunkFileNames() {
}

ChunkFileNames.prototype.apply = function( compiler ) {
	compiler.plugin("compilation", function( compilation ) {
		compilation.mainTemplate.plugin("require-ensure", function( _, chunk ) {
			var chunkMaps = chunk.getChunkMaps();
			return this.asString( [
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
					"window.__chunkErrors[ " + JSON.stringify( chunkMaps.name ) + "[chunkId]||chunkId ]=null;",
					"var head = document.getElementsByTagName('head')[0];",
					"var script = document.createElement( 'script' );",
					"var isDebug = window.app.isDebug;",
					"script.type = 'text/javascript';",
					"script.charset = 'utf-8';",
					"script.async = true;",
					"script.onerror = function() {",
					this.indent( [
						"script.onerror = script.onload = script.onreadystatechange = null;",
						"delete installedChunks[ chunkId ];",
						"window.__chunkErrors[ " + JSON.stringify( chunkMaps.name ) + "[chunkId]||chunkId ]=new Error();",
						"callback.call( null, " + this.requireFn + ")"
					] ),
					"};",
					"script.src = " + this.requireFn + ".p + (" + JSON.stringify( chunkMaps.name ) + "[chunkId]||chunkId) + '.' + (" + JSON.stringify( chunkMaps.hash ) + "[chunkId]||chunkID) + ( isDebug ? '' : '.min' ) + '.js';",
					"head.appendChild( script );"
				] ),
				"}"
			] );

		} );
	});
};

module.exports = ChunkFileNames;
