const PLUGIN_NAME = 'ExtractManifestPlugin';
const { ConcatSource } = require( 'webpack' ).sources;

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

			// This method is called on different ocasions to generate the name of an asset. Sometimes the result of this method
			// will be used as the actual filename of the asset, but sometimes it will used as a JS expression to compute the
			// name of the asset at runtime.
			//
			// We are only intersted in intercept the latter. We use the 'shape' of the second argument as a heuristic to determine
			// which case we are dealing with. Most of the time this method will be called with a `Chunk` instance in `data.chunk`.
			// That is usually used to generate the filename of the asset and we'll ignore those. The cases we are intersted in is
			// when webpack calls this method with a `Chunk`-like object in `data.chunk` but with extra methods. In particular,
			// when data.chunk.hashWithLength. Inspecting the codebase this only happens when webpack wants to generate a JS expression
			// that will be embeded inside the manifest and will be used to map chunkIds to filenames at runtime.
			//
			// In that case, `filenameExpression` is a template like `[name].[chunkhash].js` and webpack expects an expression back,
			// something like `({1:'chunk1', 2:'chunk2'}[chunkId])+"."+({1:'abcd', 2:'1234'}[chunkId])+".js"`. This method will
			// intercept such cases, store the chunkId maps (the `({1:'chunk1', 2:'chunk2'})` parts) in a global variable, and return
			// an expression that references that global variable.
			//
			// It works by adding a second asset called `manifest.js` to the `runtime` chunk.
			//
			// Example: if filenameExpression is "[name].[chunkhash].js", we end up with
			//
			// - Result of this method:
			//		window.__WEBPACK_MANIFEST.get('name')(chunkId) + "." + window.__WEBPACK_MANIFEST.get('chunkhash')(chunkId) + ".js"
			//
			// - In runtime.js (after webpack embeds the above result)
			//		function jsonpScriptSrc(chunkId) {
			//			return window.__WEBPACK_MANIFEST.get('name')(chunkId) + "." + window.__WEBPACK_MANIFEST.get('chunkhash')(chunkId) + ".js"
			//		}
			//
			// - In manifest.js:
			//		window.__WEBPACK_MANIFEST=new Map();
			//		window.__WEBPACK_MANIFEST.set('name', (chunkId) => {1:'my-name'}[chunkId]);
			//		window.__WEBPACK_MANIFEST.set('chunkhash', (chunkId) => {1:'abcd1234'}[chunkId]);
			//
			// - At runtime, when webpack wants to load the asset for the chunk #1, it will call `jsonpScriptSrc(1)` it will get back `my-name.abcd1234.js`
			compilation.hooks.assetPath.tap( PLUGIN_NAME, ( filenameExpression, options, assetInfo ) => {
				// When there is no `chunk.hashWithLength`, this hook has been called to generate the filename of an asset, not an expression.
				// Return whatever Webpack generates unmodified.
				if ( ! ( options.chunk && options.chunk.hashWithLength ) ) return filenameExpression;

				// Check we are not calling ourselfs recursively
				if ( options.skipExtractManifestPlugin ) return filenameExpression;

				// Capture the initial quote to make sure we are using the right one when concatenating code.
				const [ , quote = '"' ] = filenameExpression.match( quoteRegex );

				// For each variable in brackets, generate a map chunkId->value for that variable and store it in a global function
				return filenameExpression.replace( variableRegex, function ( match, variable ) {
					// If the variable has been already captured, don't try to generate the value again
					if ( ! variablesProcessed.has( variable ) ) {
						// Call webpack again to generate the chunkId->value map for that specific variable.
						let nameExpression;
						try {
							nameExpression = compilation.getAssetPath(
								`"[${ variable }]"`,
								{
									...options,
									// Avoid infinite loops
									skipExtractManifestPlugin: true,
								},
								assetInfo
							);
						} catch {
							// Error trying to get webpack to give us the replacement map. Return the original string
							// without any replacement and let wepback continue doing its work. The worst case secenario is that we
							// don't replace this variable with a global function, and therefore the chunkId->value map is embeded
							// directly in the runtime.
							return match;
						}

						// `nameExpression` is an expression that assumes `chunkId` exists in the scope (like `({1:'chunk1', 2:'chunk2'}[chunkId])`).
						// Transform it to a function and add it to the manifest.
						manifestContent.push(
							`${ globalManifest }.set('${ variable }', function(chunkId){return ${ nameExpression };});`
						);
						variablesProcessed.add( variable );
					}
					// Create an expression that calls the generated manifest function with the chunkId
					return `${ quote }+${ globalManifest }.get('${ variable }')(chunkId)+${ quote }`;
				} );
			} );

			// When generating the files for the `runtime` chunk, add a second file with the content of the manifest. This will reuse the filename
			// template and hash for both files (eg: it will generate `runtime.<hash>.js` and `manifest.<hash>.js` and both <hash> will be the same).
			//
			// The logic has been copied from webpack/lib/javascript/JavascriptModulesPlugin.js
			compilation.hooks.renderManifest.tap( PLUGIN_NAME, ( result, options ) => {
				const { chunk, outputOptions } = options;

				if ( chunk.name === this.options.runtimeChunk ) {
					// Using unshift so the manifest comes before the runtime, so when the runtime runs, all globals are already in place.
					result.unshift( {
						render: () => new ConcatSource( ...manifestContent ),
						filenameTemplate: chunk.filenameTemplate || outputOptions.filename,
						pathOptions: {
							hash: options.hash,
							runtime: chunk.runtime,
							contentHashType: 'javascript',
							chunk: {
								...chunk,
								name: this.options.manifestName,
							},
						},
						identifier: `chunk${ chunk.id }-manifest`,
						hash: chunk.contentHash.javascript,
					} );
				}
				return result;
			} );
		} );
	}
}

module.exports = ExtractManifestPlugin;
