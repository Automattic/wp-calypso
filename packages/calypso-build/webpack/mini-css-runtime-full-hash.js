const { MODULE_TYPE: MINI_CSS_CONTENT_TYPE } = require( 'mini-css-extract-plugin/dist/utils' );
const webpack = require( 'webpack' );

const PLUGIN_NAME = 'MiniCSSRuntimeFullHash';
const MINI_CSS_FILENAME_RUNTIME_MODULE_NAME = 'get mini-css chunk filename';
const MINI_CSS_FILENAME_RUNTIME_GLOBAL = `${ webpack.RuntimeGlobals.require }.miniCssF`;
const RUNTIME_MODULE_GENERATED_CODE_CACHE_FIELD = '_cachedGeneratedCode';

function isMiniCssFilenameRuntimeModule( module ) {
	return (
		module &&
		module.name === MINI_CSS_FILENAME_RUNTIME_MODULE_NAME &&
		module.global === MINI_CSS_FILENAME_RUNTIME_GLOBAL &&
		module.contentType === MINI_CSS_CONTENT_TYPE
	);
}

function clearRuntimeModuleGeneratedCodeCache( module ) {
	if (
		! Object.prototype.hasOwnProperty.call( module, RUNTIME_MODULE_GENERATED_CODE_CACHE_FIELD )
	) {
		throw new Error(
			`${ PLUGIN_NAME }: expected webpack RuntimeModule to expose ${ RUNTIME_MODULE_GENERATED_CODE_CACHE_FIELD }. ` +
				'Webpack internals may have changed; refusing to silently emit possibly stale miniCssF runtime code.'
		);
	}

	module[ RUNTIME_MODULE_GENERATED_CODE_CACHE_FIELD ] = undefined;
}

function iterableHasItems( iterable ) {
	return !! iterable && ! iterable[ Symbol.iterator ]().next().done;
}

function hasAsyncMiniCssChunks( compilation ) {
	const { chunkGraph } = compilation;

	for ( const chunk of compilation.chunks ) {
		if ( chunk.canBeInitial() ) {
			continue;
		}

		if (
			iterableHasItems(
				chunkGraph.getChunkModulesIterableBySourceType( chunk, MINI_CSS_CONTENT_TYPE )
			)
		) {
			return true;
		}
	}

	return false;
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
					clearRuntimeModuleGeneratedCodeCache( module );
				}
			} );

			compilation.hooks.afterSeal.tap( PLUGIN_NAME, () => {
				if ( miniCssFilenameRuntimeModules.size > 0 || ! hasAsyncMiniCssChunks( compilation ) ) {
					return;
				}

				throw new Error(
					`${ PLUGIN_NAME }: expected to find webpack's mini-css filename runtime module, ` +
						`but none matched ${ MINI_CSS_FILENAME_RUNTIME_MODULE_NAME } / ` +
						`${ MINI_CSS_FILENAME_RUNTIME_GLOBAL } / ${ MINI_CSS_CONTENT_TYPE }. ` +
						'Webpack or mini-css-extract-plugin internals may have changed.'
				);
			} );
		} );
	}
};

module.exports.isMiniCssFilenameRuntimeModule = isMiniCssFilenameRuntimeModule;
