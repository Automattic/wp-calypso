const webpack = require( 'webpack' );

const PLUGIN_NAME = 'MiniCSSRuntimeFullHash';
const MINI_CSS_FILENAME_RUNTIME_MODULE_NAME = 'get mini-css chunk filename';
const MINI_CSS_FILENAME_RUNTIME_GLOBAL = `${ webpack.RuntimeGlobals.require }.miniCssF`;

function isMiniCssFilenameRuntimeModule( module ) {
	return (
		module.name === MINI_CSS_FILENAME_RUNTIME_MODULE_NAME &&
		module.global === MINI_CSS_FILENAME_RUNTIME_GLOBAL
	);
}

module.exports = class MiniCSSRuntimeFullHashPlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( PLUGIN_NAME, ( compilation ) => {
			const miniCssFilenameRuntimeModules = new Set();

			compilation.hooks.runtimeModule.tap( PLUGIN_NAME, ( module, chunk ) => {
				if ( ! isMiniCssFilenameRuntimeModule( module ) ) {
					return;
				}

				miniCssFilenameRuntimeModules.add( module );
				module.fullHash = true;
				module.dependentHash = false;
				compilation.chunkGraph.addFullHashModuleToChunk( chunk, module );
			} );

			compilation.hooks.afterHash.tap( PLUGIN_NAME, () => {
				for ( const module of miniCssFilenameRuntimeModules ) {
					// RuntimeModule caches generated code internally. Clear any early code
					// generated before the full-hash pass finalized referenced CSS hashes.
					module._cachedGeneratedCode = undefined;
				}
			} );
		} );
	}
};

module.exports.isMiniCssFilenameRuntimeModule = isMiniCssFilenameRuntimeModule;
