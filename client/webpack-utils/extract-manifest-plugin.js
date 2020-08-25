const PLUGIN_NAME = 'ExtractManifestPlugin';
const { ConcatSource } = require( 'webpack-sources' );

class ExtractManifestPlugin {
	constructor( options = {} ) {
		this.options = {
			manifestName: 'manifest',
			runtimeChunk: 'runtime',
			globalManifest: 'window.__WEBPACK_MANIFEST',
			...options,
		};
	}

	apply( compiler ) {
		// Tapping into compiler.make allow us to come after the regular TemplatedPathPlugin
		compiler.hooks.compilation.tap( PLUGIN_NAME, ( compilation ) => {
			const globalManifest = this.options.globalManifest;
			const manifestContent = [ `${ globalManifest }=new Map();` ];
			const quoteRegex = new RegExp( /^(['"])/ );
			const variableRegex = new RegExp( /\[(.*?)\]/gi );
			const variablesProcessed = new Set();

			// This method is hock several times. First, it is called to generate the filename of each chunk. In that
			// case, `data.hashWithLength` won't be defined and we just forward the output of the original filenameExpression.
			//
			// It will also be called to generate an expression that receives a chunkId and returns the filename where that chunkId is
			// saved, something like `({1:'chunk1', 2:'chunk2'}[chunkId])+".min.js"` (simplified example). In this case, capture the expressions
			// that do the variable replacement and store them in a global Map. This allows reusing those expressions later in the runtime so we
			// don't have to concatenate the chunkId map multiple times.
			//
			// Simplified example: if filenameExpression is "[name].[chunkhash].js", we end up with
			//
			// - In runtime:
			//		function jsonpScriptSrc(chunkId) {
			//			return window.__WEBPACK_MANIFEST.get('name')(chunkId) + "." + window.__WEBPACK_MANIFEST.get('chunkhash')(chunkId) + ".js"
			//		}
			//
			// - In manifest:
			//		window.__WEBPACK_MANIFEST=new Map();
			//		window.__WEBPACK_MANIFEST.set('name', (chunkId) => {1:'my-name'}[chunkId]);
			//		window.__WEBPACK_MANIFEST.set('chunkhash', (chunkId) => {1:'abcd1234'}[chunkId]);
			//
			// So when webpack calls `jsonpScriptSrc(1)` it gets `my-name.abcd1234.js`
			compilation.mainTemplate.hooks.assetPath.tap(
				PLUGIN_NAME,
				( filenameExpression, options, assetInfo ) => {
					// When there is no `chunk.hashWithLength`, this hook has been called to generate the file name of a chunk.
					// Return whatever Webpack generates unmodified.
					if (
						options.skipExtractManifestPlugin ||
						! ( options.chunk && options.chunk.hashWithLength )
					) {
						return filenameExpression;
					}

					// Capture the quote to make sure we are using the right one when concatenating code.
					const [ , quote = '"' ] = filenameExpression.match( quoteRegex );

					return filenameExpression.replace( variableRegex, function ( match, variable ) {
						// If the variable has been prcoessed (i.e. is already in the manifest), dont' try to get the
						// value again.
						if ( ! variablesProcessed.has( variable ) ) {
							// Call webpack again to generate the chunk map for that specific variable.
							let nameExpression;
							try {
								nameExpression = compilation.mainTemplate.getAssetPath(
									`"[${ variable }]"`,
									{
										...options,
										// Avoid infinite loops
										skipExtractManifestPlugin: true,
									},
									assetInfo
								);
							} catch {
								// Error trying to get Webpack to give us the replacement map. Return the original string
								// without any replacement and let wepback continue doing its work.
								return match;
							}
							// `nameExpression` is an expression that assumes `chunkId` (like `({1:'chunk1', 2:'chunk2'}[chunkId])`).
							// Transform it to a function and store it in the manifest.
							manifestContent.push(
								`${ globalManifest }.set('${ variable }', function(chunkId){return ${ nameExpression };};`
							);
							variablesProcessed.add( variable );
						}
						// Create an expression that calls the generated manifest function with the chunkId
						return `${ quote }+${ globalManifest }.get('${ variable }')(chunkId)+${ quote }`;
					} );
				}
			);

			// When generating the files for the `runtime` chunk, add a second file with the content of the manifest. This will reuse the filename
			// template and hash for both files (eg: it will generate `runtime.<hash>.js` and `manifest.<hash>.js` and both <hash> will be the same).
			//
			// The logic has been copied from ebpack/lib/JavascriptModulesPlugin.js
			compilation.mainTemplate.hooks.renderManifest.tap( PLUGIN_NAME, ( result, options ) => {
				const { chunk, outputOptions } = options;
				const fullHash = options.fullHash;
				const useChunkHash = compilation.mainTemplate.useChunkHash( chunk );

				if ( chunk.name === this.options.runtimeChunk ) {
					// Using unshift so the manifest comes before the runtime. Only relevant for assets-writer
					result.unshift( {
						render: () => new ConcatSource( ...manifestContent ),
						filenameTemplate: chunk.filenameTemplate || outputOptions.filename,
						pathOptions: {
							contentHashType: 'javascript',
							chunk: {
								...chunk,
								name: this.options.manifestName,
							},
						},
						identifier: `chunk${ chunk.id }-manifest`,
						hash: useChunkHash ? chunk.hash : fullHash,
					} );
				}
				return result;
			} );
		} );
	}
}

module.exports = ExtractManifestPlugin;
